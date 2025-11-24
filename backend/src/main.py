from fastapi import FastAPI

from src.api.routers.tasks import router as tasks_router
#from src.api.routers.users import router as user_router
#from src.api.routers.lectures import router as lecture_router
from src.wsmanager import manager
from src.celery_app import ws_event_listener
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Запускаем слушатель как фоновую задачу
    listener_task = asyncio.create_task(ws_event_listener())
    print("✅ WebSocket event listener started")
    yield
    # Завершаем задачу при остановке приложения
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        pass
    print("🛑 WebSocket event listener stopped")

app = FastAPI(lifespan=lifespan)

app.include_router(tasks_router)
#app.include_router(user_router)
#app.include_router(lecture_router)

@app.get("/")
async def health_check():
    print("[HEALTH] Health check OK")
    return {"status": "ok"}