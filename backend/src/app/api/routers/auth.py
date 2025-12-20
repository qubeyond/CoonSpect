from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.app.db.redis import redis_sync as redis
from src.app.api.schemas.user import UserCreate, Token, RefreshTokenRequest, LogoutRequest
from src.app.api.schemas.status import Status
from src.app.api.deps import get_current_user
from src.app.db.session import get_db
from src.app.db.models.user import User
from src.app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(
        username=user_in.username,
        password_hash=hash_password(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
def refresh(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    # Проверяем, не в чёрном ли списке
    if redis.exists(f"blacklist:{request.refresh_token}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    try:
        payload = decode_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Инвалидируем старый refresh-токен (rolling tokens)
    refresh_exp = payload["exp"]
    refresh_ttl = max(int(refresh_exp - datetime.now(timezone.utc).timestamp()), 1)
    redis.setex(f"blacklist:{request.refresh_token}", refresh_ttl, "true")
    
    # Выдаём новые токены
    access_token = create_access_token(username)
    refresh_token = create_refresh_token(username)
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/logout")
def logout(
    request: Request,
    logout_request: LogoutRequest,
    current_user: User = Depends(get_current_user)
):
    # Access-токен уже проверен через Depends, но мы всё равно его извлекаем
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing access token")
    
    access_token = auth_header[len("Bearer "):]

    # Проверяем refresh-токен
    try:
        refresh_payload = decode_token(logout_request.refresh_token)
        if refresh_payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Проверяем, не в чёрном ли списке refresh-токен
    if redis.exists(f"blacklist:{logout_request.refresh_token}"):
        raise HTTPException(status_code=401, detail="Token already revoked")

    # TTL для refresh-токена
    refresh_exp = refresh_payload["exp"]
    refresh_ttl = max(int(refresh_exp - datetime.now(timezone.utc).timestamp()), 1)

    # TTL для access-токена
    try:
        access_payload = decode_token(access_token)
        if access_payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        access_exp = access_payload["exp"]
        access_ttl = max(int(access_exp - datetime.now(timezone.utc).timestamp()), 1)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid access token")

    # Добавляем оба токена в чёрный список
    redis.setex(f"blacklist:{logout_request.refresh_token}", refresh_ttl, "true")
    redis.setex(f"blacklist:{access_token}", access_ttl, "true")
    
    return Status.success("Logged out successfully")