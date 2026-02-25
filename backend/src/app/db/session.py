from collections.abc import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

from src.app.config import settings

async_engine = create_async_engine(
    settings.POSTGRES_URL,
    pool_size=settings.POSTGRES_POOL_SIZE,
    max_overflow=settings.POSTGRES_MAX_OVERFLOW,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

sync_engine = create_engine(
    settings.POSTGRES_SYNC_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)

def get_sync_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
