from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class LectureBase(BaseModel):
    audio_url: str | None = None
    text_url: str | None = None
    segments_url: str | None = None


class LectureCreate(BaseModel):
    user_id: UUID


class LectureRead(LectureBase):
    id: UUID
    user_id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        orm_mode = True
