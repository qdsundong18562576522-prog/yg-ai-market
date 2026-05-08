import json
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, AsyncSessionLocal
from app.models import User, App, ChatSession, ChatMessage
from app.schemas import ChatRequest, ApiResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/chat")
async def ai_chat(
    req: ChatRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    app_result = await db.execute(
        select(App).where(and_(App.id == req.app_id, App.is_active == True, App.access_mode == "api_call"))
    )
    app = app_result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="应用不存在或不支持API调用模式")

    if not app.app_model_config or app.app_model_config == "{}":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="应用未配置AI模型参数")

    config = json.loads(app.app_model_config)

    # Create or reuse session
    if req.session_id:
        session_result = await db.execute(
            select(ChatSession).where(
                and_(ChatSession.id == req.session_id, ChatSession.user_id == current_user.id)
            )
        )
        session = session_result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="对话不存在")
    else:
        title = req.message[:30] + "..." if len(req.message) > 30 else req.message
        session = ChatSession(user_id=current_user.id, app_id=req.app_id, title=title)
        db.add(session)
        await db.commit()
        await db.refresh(session)

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=req.message)
    db.add(user_msg)
    await db.commit()

    # Build conversation history
    history_result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at)
    )
    history = history_result.scalars().all()

    messages = [{"role": "system", "content": "你是一个智能AI助手，请友好地回答用户的问题。"}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    provider = config.get("provider", "openai-compatible")
    base_url = config.get("base_url", "https://api.deepseek.com/v1").rstrip("/")
    api_key = config.get("api_key", "")
    model = config.get("model", "deepseek-chat")
    temperature = config.get("temperature", 0.7)
    max_tokens = config.get("max_tokens", 4096)

    if provider == "hermes":
        if not model:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hermes 模型未配置")

        async def generate():
            full_content = ""
            async with httpx.AsyncClient(timeout=120.0, trust_env=False) as client:
                try:
                    # 1. Get or create Hermes session (for conversation continuity)
                    hermes_sid = session.external_session_id
                    if not hermes_sid:
                        sess_resp = await client.post(f"{base_url}/api/session/new", json={})
                        if sess_resp.status_code != 200:
                            yield f"data: {json.dumps({'error': f'Hermes创建会话失败: {sess_resp.status_code}'})}\n\n"
                            yield "data: [DONE]\n\n"
                            return
                        hermes_sid = sess_resp.json()["session"]["session_id"]
                        # Save Hermes session ID for subsequent messages
                        async with AsyncSessionLocal() as save_db:
                            save_session = await save_db.get(ChatSession, session.id)
                            if save_session:
                                save_session.external_session_id = hermes_sid
                                await save_db.commit()

                    # 2. Send only the current user message (no history)
                    current_msg = messages[-1]["content"] if messages else req.message

                    # 3. Start chat on Hermes
                    start_resp = await client.post(f"{base_url}/api/chat/start", json={
                        "session_id": hermes_sid,
                        "message": current_msg,
                        "model": model,
                    })
                    start_data = start_resp.json()
                    stream_id = start_data.get("stream_id", "")
                    if not stream_id:
                        yield f"data: {json.dumps({'error': 'Hermes未返回stream_id: ' + json.dumps(start_data)})}\n\n"
                        yield "data: [DONE]\n\n"
                        return

                    # 4. Stream response via SSE
                    async with client.stream("GET", f"{base_url}/api/chat/stream?stream_id={stream_id}") as sse:
                        current_event = ""
                        async for line in sse.aiter_lines():
                            if await request.is_disconnected():
                                break
                            if line.startswith("event: "):
                                current_event = line[7:].strip()
                            elif line.startswith("data: ") and current_event == "token":
                                try:
                                    chunk = json.loads(line[6:])
                                    text = chunk.get("text", "")
                                    if text:
                                        full_content += text
                                        yield f"data: {json.dumps({'content': text})}\n\n"
                                except json.JSONDecodeError:
                                    continue
                            elif line.startswith("data: ") and current_event == "error":
                                try:
                                    err_data = json.loads(line[6:])
                                    err_text = err_data.get("text", str(err_data))
                                    yield f"data: {json.dumps({'error': 'Hermes错误: ' + err_text})}\n\n"
                                except json.JSONDecodeError:
                                    pass
                                break
                            elif current_event == "done":
                                break

                except Exception as e:
                    yield f"data: {json.dumps({'error': f'Hermes请求失败: {str(e)}'})}\n\n"

            # Save assistant message
            if full_content:
                async with AsyncSessionLocal() as save_db:
                    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=full_content)
                    save_db.add(assistant_msg)
                    session.updated_at = datetime.utcnow()
                    await save_db.commit()

            yield "data: [DONE]\n\n"

    else:
        if not api_key:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="API Key 未配置")

        async def generate():
            full_content = ""
            async with httpx.AsyncClient(timeout=60.0) as client:
                try:
                    async with client.stream(
                        "POST",
                        f"{base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": model,
                            "messages": messages,
                            "temperature": temperature,
                            "max_tokens": max_tokens,
                            "stream": True,
                        },
                    ) as resp:
                        if resp.status_code != 200:
                            error_text = await resp.aread()
                            yield f"data: {json.dumps({'error': f'AI接口返回错误: {resp.status_code} - {error_text.decode()}'})}\n\n"
                            yield "data: [DONE]\n\n"
                            return

                        async for line in resp.aiter_lines():
                            if await request.is_disconnected():
                                break
                            if not line.startswith("data: "):
                                continue
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    full_content += content
                                    yield f"data: {json.dumps({'content': content})}\n\n"
                            except json.JSONDecodeError:
                                continue

                except Exception as e:
                    yield f"data: {json.dumps({'error': f'请求AI接口失败: {str(e)}'})}\n\n"

            # Save assistant message
            if full_content:
                async with AsyncSessionLocal() as save_db:
                    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=full_content)
                    save_db.add(assistant_msg)
                    session.updated_at = datetime.utcnow()
                    await save_db.commit()

            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


