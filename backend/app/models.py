from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    display_name = Column(String(50), nullable=False)
    department = Column(String(100), default="")
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    installed_apps = relationship("UserApp", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


class App(Base):
    __tablename__ = "app"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    icon = Column(Text, default="")
    access_mode = Column(String(20), nullable=False)
    access_url = Column(Text, default="")
    app_model_config = Column(Text, default="{}")
    tags = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by])
    installed_by = relationship("UserApp", back_populates="app", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="app", cascade="all, delete-orphan")


class UserApp(Base):
    __tablename__ = "user_app"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    app_id = Column(Integer, ForeignKey("app.id", ondelete="CASCADE"), nullable=False)
    installed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="installed_apps")
    app = relationship("App", back_populates="installed_by")


class ChatSession(Base):
    __tablename__ = "chat_session"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    app_id = Column(Integer, ForeignKey("app.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), default="新对话")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    app = relationship("App", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_message"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("chat_session.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
