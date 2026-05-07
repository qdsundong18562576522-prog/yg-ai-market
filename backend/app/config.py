import os


class Settings:
    APP_NAME: str = "yg-ai-market"
    APP_VERSION: str = "1.0.0"

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "ygkj-ai-market-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    DATABASE_URL: str = f"sqlite+aiosqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yg_ai_market.db')}"

    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"
    DEFAULT_ADMIN_DISPLAY_NAME: str = "系统管理员"
    DEFAULT_ADMIN_DEPARTMENT: str = "IT部"

    CORS_ORIGINS: list = ["http://localhost:12400", "http://127.0.0.1:12400"]

    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "12401"))
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")


settings = Settings()
