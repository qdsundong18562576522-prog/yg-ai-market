import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, App
from app.schemas import AppCreate, AppUpdate, AppOut, ApiResponse
from app.dependencies import get_admin_user

router = APIRouter()


@router.get("", response_model=ApiResponse)
async def list_apps(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(App).order_by(App.sort_order, App.id))
    apps = result.scalars().all()
    return ApiResponse(data=[AppOut.model_validate(a) for a in apps])


@router.post("", response_model=ApiResponse)
async def create_app(req: AppCreate, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    config_str = req.app_model_config.model_dump_json() if req.app_model_config else "{}"
    app = App(
        name=req.name,
        description=req.description,
        icon=req.icon,
        access_mode=req.access_mode,
        access_url=req.access_url,
        app_model_config=config_str,
        tags=req.tags,
        sort_order=req.sort_order,
        is_active=True,
        created_by=admin.id,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return ApiResponse(data=AppOut.model_validate(app))


@router.put("/{app_id}", response_model=ApiResponse)
async def update_app(app_id: int, req: AppUpdate, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="应用不存在")

    if req.name is not None:
        app.name = req.name
    if req.description is not None:
        app.description = req.description
    if req.icon is not None:
        app.icon = req.icon
    if req.access_mode is not None:
        app.access_mode = req.access_mode
    if req.access_url is not None:
        app.access_url = req.access_url
    if req.app_model_config is not None:
        app.app_model_config = req.app_model_config.model_dump_json()
    if req.tags is not None:
        app.tags = req.tags
    if req.sort_order is not None:
        app.sort_order = req.sort_order

    await db.commit()
    await db.refresh(app)
    return ApiResponse(data=AppOut.model_validate(app))


@router.delete("/{app_id}", response_model=ApiResponse)
async def delete_app(app_id: int, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="应用不存在")
    await db.delete(app)
    await db.commit()
    return ApiResponse(message="删除成功")


@router.put("/{app_id}/toggle-active", response_model=ApiResponse)
async def toggle_app_active(app_id: int, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="应用不存在")
    app.is_active = not app.is_active
    await db.commit()
    return ApiResponse(data={"is_active": app.is_active})
