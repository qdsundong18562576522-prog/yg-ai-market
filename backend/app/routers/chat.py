from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, App, ChatSession, ChatMessage
from app.schemas import ChatSessionOut, ChatMessageOut, ApiResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/sessions", response_model=ApiResponse)
async def list_sessions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()

    data = []
    for s in sessions:
        app_result = await db.execute(select(App.name).where(App.id == s.app_id))
        app_name = app_result.scalar_one_or_none() or ""
        data.append(ChatSessionOut(
            id=s.id, app_id=s.app_id, app_name=app_name,
            title=s.title, created_at=s.created_at, updated_at=s.updated_at,
        ))

    return ApiResponse(data=data)


@router.get("/sessions/{session_id}", response_model=ApiResponse)
async def get_session(session_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession).where(and_(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="对话不存在")

    messages_result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    )
    messages = messages_result.scalars().all()

    app_result = await db.execute(select(App.name).where(App.id == session.app_id))
    app_name = app_result.scalar_one_or_none() or ""

    return ApiResponse(data={
        "session": ChatSessionOut(
            id=session.id, app_id=session.app_id, app_name=app_name,
            title=session.title, created_at=session.created_at, updated_at=session.updated_at,
        ),
        "messages": [ChatMessageOut.model_validate(m) for m in messages],
    })


@router.delete("/sessions/{session_id}", response_model=ApiResponse)
async def delete_session(session_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatSession).where(and_(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="对话不存在")

    await db.delete(session)
    await db.commit()
    return ApiResponse(message="删除成功")
