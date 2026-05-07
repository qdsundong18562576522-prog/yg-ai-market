from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.models import User, App
from app.utils import hash_password
from app.routers import auth, users, apps, user_apps, chat, ai_gateway


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_default_data()
    yield


async def seed_default_data():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == settings.DEFAULT_ADMIN_USERNAME))
        if not result.scalar_one_or_none():
            admin = User(
                username=settings.DEFAULT_ADMIN_USERNAME,
                password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
                display_name=settings.DEFAULT_ADMIN_DISPLAY_NAME,
                department=settings.DEFAULT_ADMIN_DEPARTMENT,
                role="admin",
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)

            default_app = App(
                name="AI智能助手",
                description="基于 DeepSeek 的智能对话助手，开箱即用。",
                icon="/icons/chat.png",
                access_mode="api_call",
                access_url="",
                app_model_config='{"provider":"deepseek","model":"deepseek-chat","api_key":"sk-xxx","base_url":"https://api.deepseek.com/v1","temperature":0.7,"max_tokens":4096}',
                tags="对话,通用,内置",
                is_active=True,
                sort_order=1,
                created_by=admin.id,
            )
            db.add(default_app)
            await db.commit()


app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/v1/users", tags=["用户管理"])
app.include_router(apps.router, prefix="/api/v1/apps", tags=["应用管理"])
app.include_router(user_apps.router, prefix="/api/v1/market", tags=["应用市场"])
app.include_router(chat.router, prefix="/api/v1/ai", tags=["AI对话"])
app.include_router(ai_gateway.router, prefix="/api/v1/ai", tags=["AI网关"])
