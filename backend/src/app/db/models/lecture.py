import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base
from .enums import LectureStatus


class Lecture(Base):
    __tablename__ = "lectures"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Метаданные

    title: Mapped[str | None] = mapped_column(
        String(255)
    )

    audio_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )

    text_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )

    text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Статусы

    status: Mapped[LectureStatus] = mapped_column(
        String(20),
        server_default=LectureStatus.UPLOADED,
        default=LectureStatus.UPLOADED,
        index=True
    )

    is_public: Mapped[bool] = mapped_column(
        default=False,
        index=True
    )

    # Таймстампы

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Связи

    owner: Mapped["User"] = relationship(
        "User",
        back_populates="lectures"
    )

    def __repr__(self) -> str:
        return f"Lecture(id={self.id!r}, title={self.title!r})"
