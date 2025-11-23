from fastapi import FastAPI

from src.api.routers.tasks import router as tasks_router
#from src.api.routers.users import router as user_router
#from src.api.routers.lectures import router as lecture_router
from src.wsmanager import manager
from src.celery_app import run_audio_pipeline

app = FastAPI()

app.include_router(tasks_router)
#app.include_router(user_router)
#app.include_router(lecture_router)

@app.get("/")
async def health_check():
    print("[HEALTH] Health check OK")
    return {"status": "ok"}