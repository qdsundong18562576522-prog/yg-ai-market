from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, App, UserApp
from app.schemas import AppOut, AppMarketItem, ApiResponse
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/apps", response_model=ApiResponse)
async def market_apps(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(App).where(App.is_active == True).order_by(App.sort_order, App.id)
    )
    apps = result.scalars().all()

    installed_result = await db.execute(
        select(UserApp.app_id).where(UserApp.user_id == current_user.id)
    )
    installed_ids = {row[0] for row in installed_result.fetchall()}

    items = []
    for a in apps:
        item = AppMarketItem(
            **{c.name: getattr(a, c.name) for c in a.__table__.columns},
            installed=a.id in installed_ids,
        )
        items.append(item)

    return ApiResponse(data=items)


@router.get("/apps/{app_id}", response_model=ApiResponse)
async def market_app_detail(app_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(App).where(App.id == app_id, App.is_active == True))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="应用不存在或已下架")

    install_result = await db.execute(
        select(UserApp).where(and_(UserApp.user_id == current_user.id, UserApp.app_id == app_id))
    )
    installed = install_result.scalar_one_or_none() is not None

    item = AppMarketItem(
        **{c.name: getattr(app, c.name) for c in app.__table__.columns},
        installed=installed,
    )
    return ApiResponse(data=item)


@router.post("/apps/{app_id}/install", response_model=ApiResponse)
async def install_app(app_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    app_result = await db.execute(select(App).where(App.id == app_id, App.is_active == True))
    app = app_result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="应用不存在或已下架")

    existing = await db.execute(
        select(UserApp).where(and_(UserApp.user_id == current_user.id, UserApp.app_id == app_id))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="已安装该应用")

    ua = UserApp(user_id=current_user.id, app_id=app_id)
    db.add(ua)
    await db.commit()
    return ApiResponse(message="安装成功")


@router.delete("/apps/{app_id}/install", response_model=ApiResponse)
async def uninstall_app(app_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserApp).where(and_(UserApp.user_id == current_user.id, UserApp.app_id == app_id))
    )
    ua = result.scalar_one_or_none()
    if not ua:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="未安装该应用")

    await db.delete(ua)
    await db.commit()
    return ApiResponse(message="卸载成功")


@router.get("/installed", response_model=ApiResponse)
async def installed_apps(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(App)
        .join(UserApp, UserApp.app_id == App.id)
        .where(UserApp.user_id == current_user.id, App.is_active == True)
        .order_by(App.sort_order, App.id)
    )
    apps = result.scalars().all()
    return ApiResponse(data=[AppOut.model_validate(a) for a in apps])
