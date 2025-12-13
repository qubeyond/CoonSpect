from fastapi import APIRouter, HTTPException
from fastapi import WebSocket, WebSocketDisconnect
from fastapi import UploadFile, File
import redis
import uuid
import json
import tempfile
from src.schemas.status import Status

from src.wsmanager import manager
from src.celery_app import run_audio_pipeline, run_audio_pipeline_test

r = redis.Redis(
    host = 'redis',  # имя сервиса в docker-compose
    port = 6379,
    db = 0,
    decode_responses = True
)

router = APIRouter(prefix="/task", tags=["tasks"])

@router.get("/create")
def create_task():
    task_id = str(uuid.uuid4())
    r.set(f"task:{task_id}", "uploading")

    print(f"[TASK/CREATE] Created new task_id={task_id}")
    return Status(status="success", msg=task_id)

@router.get("/correct/{task_id}")
async def check_task_id(task_id: str, sender: str = "Unknown"):
    if r.exists(f"task_status:{task_id}"):
        print(f"[TASK/CORRECT] Correct task_id={task_id}, sender={sender}")
        return Status(status="success")
    print(f"[TASK/CORRECT] Invalid task_id={task_id}, sender={sender}")
    raise HTTPException(status_code=400, detail="Invalid task_id")

@router.post("/upload_audio/{task_id}")
async def upload_audio(task_id: str, file: UploadFile = File(...)):
    print(f"[UPLOAD] Task {task_id}, got file {file.filename}")
    
    if not r.exists(f"task:{task_id}"):
        raise HTTPException(status_code=400, detail="Invalid task_id")
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
            
        print(f"[UPLOAD] Saved temp file {tmp_path} ({len(content)} bytes)")

        run_audio_pipeline_test(task_id, tmp_path)

        return Status(status="success")
    except Exception as e:
        print(f"[UPLOAD] Error processing task {task_id}: {e}")
        await manager.send_message(task_id, f"error: {str(e)}")
        manager.disconnect(task_id)
        raise HTTPException(status_code=400, detail=str(e))

@router.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    print(f"[WS] Connected task {task_id}")
    if not r.exists(f"task:{task_id}"):
        print(f"[WS] task_id {task_id} not found")
        return

    await manager.connect(websocket, task_id)
    await manager.send_message(task_id, "connected")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(task_id)
        print(f"[WS] Disconnected {task_id}")