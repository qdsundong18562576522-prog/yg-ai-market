from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, ApiResponse, LoginResponseData, UserOut
from app.utils import verify_password, create_jwt
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/login", response_model=ApiResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == req.username))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账号已被禁用")

    token = create_jwt({"user_id": user.id, "role": user.role})
    return ApiResponse(data=LoginResponseData(
        token=token,
        user=UserOut.model_validate(user),
    ))


@router.get("/me", response_model=ApiResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return ApiResponse(data=UserOut.model_validate(current_user))
