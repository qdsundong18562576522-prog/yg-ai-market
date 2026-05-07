from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserUpdate, UserOut, ApiResponse
from app.utils import hash_password
from app.dependencies import get_admin_user

router = APIRouter()


@router.get("", response_model=ApiResponse)
async def list_users(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return ApiResponse(data=[UserOut.model_validate(u) for u in users])


@router.post("", response_model=ApiResponse)
async def create_user(req: UserCreate, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.username == req.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="用户名已存在")

    user = User(
        username=req.username,
        password_hash=hash_password(req.password),
        display_name=req.display_name,
        department=req.department,
        role="user",
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return ApiResponse(data=UserOut.model_validate(user))


@router.put("/{user_id}", response_model=ApiResponse)
async def update_user(user_id: int, req: UserUpdate, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    if req.display_name is not None:
        user.display_name = req.display_name
    if req.department is not None:
        user.department = req.department
    if req.password is not None:
        user.password_hash = hash_password(req.password)

    await db.commit()
    await db.refresh(user)
    return ApiResponse(data=UserOut.model_validate(user))


@router.delete("/{user_id}", response_model=ApiResponse)
async def delete_user(user_id: int, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="不能删除自己")

    await db.delete(user)
    await db.commit()
    return ApiResponse(message="删除成功")


@router.put("/{user_id}/toggle-active", response_model=ApiResponse)
async def toggle_active(user_id: int, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="不能禁用自己")

    user.is_active = not user.is_active
    await db.commit()
    return ApiResponse(data={"is_active": user.is_active})
