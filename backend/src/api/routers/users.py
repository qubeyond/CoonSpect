from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.db.models.user import User
from src.schemas.user import UserCreate, UserRead
from passlib.context import CryptContext

router = APIRouter(prefix="/api/users", tags=["users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/create", response_model=UserRead)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Создать нового пользователя.
    """
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = pwd_context.hash(user_in.password)

    new_user = User(
        username=user_in.username,
        password_hash=hashed_password,
        profile=user_in.profile,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
