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

            await seed_app_catalog(db, admin)

        # Always ensure catalog apps exist
        result = await db.execute(select(App))
        existing = result.scalars().all()
        if len(existing) <= 1:
            admin_result = await db.execute(select(User).where(User.username == settings.DEFAULT_ADMIN_USERNAME))
            admin = admin_result.scalar_one_or_none()
            if admin:
                await seed_app_catalog(db, admin)


async def seed_app_catalog(db, admin):
    apps_data = [
        {"name": "AI智能助手", "description": "基于 DeepSeek 的智能对话助手，开箱即用。", "tags": "对话,通用,AI", "sort_order": 1, "access_mode": "api_call", "app_model_config": '{"provider":"hermes","model":"@deepseek:deepseek-v4-flash","base_url":"http://192.168.112.199:8787","temperature":0.7,"max_tokens":4096}'},
        {"name": "钉钉", "description": "企业协同办公平台，让工作更高效", "tags": "办公协同,即时通讯", "icon": "/icons/dingtalk.png", "access_mode": "external_link", "access_url": "https://www.dingtalk.com"},
        {"name": "微信", "description": "沟通工具，连接你我", "tags": "办公协同,即时通讯", "icon": "/icons/wechat.png", "access_mode": "external_link", "access_url": "https://work.weixin.qq.com"},
        {"name": "飞书", "description": "先进企业协作与管理平台", "tags": "办公协同,项目管理", "icon": "/icons/feishu.png", "access_mode": "external_link", "access_url": "https://www.feishu.cn"},
        {"name": "Trello", "description": "项目管理协作工具", "tags": "项目管理,办公协同", "icon": "/icons/trello.png", "access_mode": "external_link", "access_url": "https://trello.com"},
        {"name": "Figma", "description": "在线协作设计工具", "tags": "开发工具,设计", "icon": "/icons/figma.png", "access_mode": "external_link", "access_url": "https://www.figma.com"},
        {"name": "Notion", "description": "一体化工作空间", "tags": "办公协同,项目管理", "icon": "/icons/notion.png", "access_mode": "external_link", "access_url": "https://www.notion.so"},
        {"name": "PostgreSQL", "description": "开源关系型数据库", "tags": "开发工具,数据分析", "icon": "/icons/postgresql.png", "access_mode": "external_link", "access_url": "https://www.postgresql.org"},
        {"name": "滴答清单", "description": "待办事项和任务管理", "tags": "快捷应用,项目管理", "icon": "/icons/ticktick.png", "access_mode": "external_link", "access_url": "https://www.ticktick.com"},
        {"name": "Apollo", "description": "分布式配置中心", "tags": "开发工具,快捷应用", "icon": "/icons/apollo.png", "access_mode": "external_link", "access_url": "https://www.apolloconfig.com"},
        {"name": "Jira", "description": "项目与事务跟踪工具", "tags": "项目管理,开发工具", "icon": "/icons/jira.png", "access_mode": "external_link", "access_url": "https://www.atlassian.com/software/jira"},
        {"name": "Slack", "description": "团队沟通协作平台", "tags": "办公协同,即时通讯", "icon": "/icons/slack.png", "access_mode": "external_link", "access_url": "https://slack.com"},
        {"name": "印象笔记", "description": "知识管理和笔记工具", "tags": "快捷应用,办公协同", "icon": "/icons/evernote.png", "access_mode": "external_link", "access_url": "https://www.yinxiang.com"},
        {"name": "抖音", "description": "短视频内容平台", "tags": "快捷应用,客户管理", "icon": "/icons/douyin.png", "access_mode": "external_link", "access_url": "https://www.douyin.com"},
        {"name": "小红书", "description": "生活方式分享社区", "tags": "快捷应用,客户管理", "icon": "/icons/xiaohongshu.png", "access_mode": "external_link", "access_url": "https://www.xiaohongshu.com"},
        {"name": "知乎", "description": "知识分享社区", "tags": "快捷应用,数据分析", "icon": "/icons/zhihu.png", "access_mode": "external_link", "access_url": "https://www.zhihu.com"},
        {"name": "支付宝", "description": "数字支付与金融服务", "tags": "快捷应用,财务管理", "icon": "/icons/alipay.png", "access_mode": "external_link", "access_url": "https://www.alipay.com"},
        {"name": "百度网盘", "description": "云存储服务平台", "tags": "快捷应用,办公协同", "icon": "/icons/baidupan.png", "access_mode": "external_link", "access_url": "https://pan.baidu.com"},
        {"name": "美团外卖", "description": "在线外卖订餐平台", "tags": "快捷应用,客户管理", "icon": "/icons/meituan.png", "access_mode": "external_link", "access_url": "https://waimai.meituan.com"},
        {"name": "微信读书", "description": "电子书阅读平台", "tags": "快捷应用,客户管理", "icon": "/icons/weread.png", "access_mode": "external_link", "access_url": "https://weread.qq.com"},
    ]

    for idx, app_data in enumerate(apps_data):
        existing_result = await db.execute(select(App).where(App.name == app_data["name"]))
        existing_app = existing_result.scalar_one_or_none()
        if existing_app:
            # Update existing app's config in case it changed
            for key, value in app_data.items():
                if key != "name":
                    setattr(existing_app, key, value)
            continue
        app = App(
            name=app_data["name"],
            description=app_data.get("description", ""),
            icon=app_data.get("icon", ""),
            access_mode=app_data.get("access_mode", "external_link"),
            access_url=app_data.get("access_url", ""),
            app_model_config=app_data.get("app_model_config", "{}"),
            tags=app_data.get("tags", ""),
            is_active=True,
            sort_order=app_data.get("sort_order", 99),
            created_by=admin.id,
        )
        db.add(app)
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
