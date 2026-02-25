from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.app.config import settings

sync_url = settings.POSTGRES_URL.replace("postgresql+asyncpg://", "postgresql://")

engine = create_engine(sync_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# зависимость для получения сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
