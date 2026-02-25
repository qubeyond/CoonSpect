from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

import jwt
from passlib.context import CryptContext
from src.app.config import settings
from src.app.db.redis import redis_sync as redis

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(uuid: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "uuid": uuid.int,
        "exp": int(expire.timestamp()),
        "type": "access"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(uuid: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "uuid": uuid.int,
        "exp": int(expire.timestamp()),
        "type": "refresh"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

def validate_token(token: str) -> dict[str, Any]:
    if redis.exists(f"blacklist:{token}"):
        raise Exception("Token has been revoked")

    try:
        payload = decode_token(token)
    except Exception as e:
        print(e)
        raise Exception("Can't decode token")

    if payload.get("type") != "access" and payload.get("type") != "refresh":
        raise Exception("Invalid token type")

    elif payload.get("exp") is None:
        raise Exception("Invalid token type")

    elif payload.get("exp") - datetime.now(timezone.utc).timestamp() < 0:
        raise Exception("Token expired")

    elif payload.get("uuid") is None:
        raise Exception("Invalid token payload")

    try:
        payload["uuid"] = UUID(int = payload["uuid"])
    except Exception as e:
        print(e)
        raise Exception("Invalid token payload")

    return payload
