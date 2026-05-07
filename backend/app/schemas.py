from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ApiResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Optional[object] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponseData(BaseModel):
    token: str
    user: "UserOut"


class UserCreate(BaseModel):
    username: str
    password: str
    display_name: str
    department: str = ""


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    department: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AppModelConfig(BaseModel):
    provider: str = ""
    model: str = ""
    api_key: str = ""
    base_url: str = ""
    temperature: float = 0.7
    max_tokens: int = 4096


class AppCreate(BaseModel):
    name: str
    description: str = ""
    icon: str = ""
    access_mode: str = "api_call"
    access_url: str = ""
    app_model_config: Optional[AppModelConfig] = None
    tags: str = ""
    sort_order: int = 0


class AppUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    access_mode: Optional[str] = None
    access_url: Optional[str] = None
    app_model_config: Optional[AppModelConfig] = None
    tags: Optional[str] = None
    sort_order: Optional[int] = None


class AppOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    access_mode: str
    access_url: str
    app_model_config: str
    tags: str
    is_active: bool
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class AppMarketItem(AppOut):
    installed: bool = False


class ChatRequest(BaseModel):
    app_id: int
    session_id: Optional[int] = None
    message: str


class ChatSessionOut(BaseModel):
    id: int
    app_id: int
    app_name: str = ""
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatMessageOut(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
