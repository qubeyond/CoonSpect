from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from sqlalchemy.orm import Session
from src.db.session import get_db
from src.db.models.lecture import Lecture
from src.db.models.user import User
from src.schemas.lecture import LectureCreate, LectureRead

router = APIRouter(prefix="/api/lectures", tags=["lectures"])

@router.get("/{lecture_id}", response_model=LectureRead)
def get_result(lecture_id: UUID, db: Session = Depends(get_db)):
    """
    Получить результат (ссылку на текстовый файл или готовый конспект).
    """
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    if not lecture.text_url:
        raise HTTPException(status_code=404, detail="Result not ready yet")

    return lecture
