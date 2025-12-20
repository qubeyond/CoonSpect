from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.app.api.schemas.user import UserRead
from src.app.security import decode_token
from src.app.db.session import get_db
from src.app.db.models.user import User
from src.app.db.redis import redis_sync as redis

security = HTTPBearer()

def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserRead:
    # Проверка, не в чёрном списке ли токен
    if redis.exists(f"blacklist:{token.credentials}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    try:
        payload = decode_token(token.credentials)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return UserRead.model_validate(user)