from redis.asyncio import Redis as RedisAsync
from redis import Redis as RedisSync
from celery import Celery, chain
from celery.signals import task_prerun
from src.db.session import SessionLocal
import json
import os
import requests
from src.db.models.lecture import Lecture
from pathlib import Path
import uuid
from src.db.models.user import User

import config
from src.wsmanager import manager

TASK_MESSAGES = {
    "src.celery_app.stt_task": "stt",
    "src.celery_app.rag_task": "rag",
    "src.celery_app.llm_task": "llm",
    "src.celery_app.upload_lecture_task": "saving",
    "src.celery_app.finish_task": "finish"
}
ENDING_MESSAGE = "end"
DEFAULT_MESSAGE = "unknown"

TASK_FINISH = "src.celery_app.finish_task"

r = RedisSync(
    host = "redis",
    port = config.REDIS_PORT,
    db = 0,
    decode_responses = True
)

celery = Celery(
    "tasks",
    broker = config.REDIS_URL,
    backend = config.REDIS_URL
)

@celery.task()
def stt_task(payload: dict):
    """with open(payload["audio_filepath"], "rb") as audiof:
        response = requests.post(
            config.STT_SERVICE_URL+"/transcribe",
            headers = {"task_id": payload["task_id"]},
            files = {f"audio": audiof},
            timeout = 1800
        )
    
    #os.remove(payload["audio_filepath"])
    response.raise_for_status()

    payload["data"] = response.json()["text"]"""

    payload["data"] = "demo lecture"
    return payload

@celery.task()
def upload_lecture_task(payload: dict):
    with SessionLocal() as db:
        # Создаём пользователя (заглушка убрать)
        new_user = User(
            username=str(uuid.uuid4()),
            password_hash=str(uuid.uuid4()),
            profile=str(uuid.uuid4()),       
            settings=str(uuid.uuid4()),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)


        lecture = Lecture(
            user_id=new_user.id,
            audio_url=payload["audio_filepath"],
            text_url="nourl",
            status="pending"
        )
        db.add(lecture)
        db.commit()
        db.refresh(lecture)

        text_path = Path(f"{lecture.id}.txt").resolve()
        with open(text_path, "w") as f:
            f.write(payload["data"])
        
        lecture.audio_url = str(text_path)
        db.commit()

        lecture_id = lecture.id
        
    payload["lecture_id"] = lecture_id
    return payload

@celery.task()
def finish_task(payload: dict):
    r.publish("ws_events", json.dumps({
        "task_id": payload["task_id"],
        "message": json.dumps({"status":ENDING_MESSAGE, "data":payload["data"]})
    }))
    manager.disconnect(payload["task_id"])

@task_prerun.connect
def track_task(task_id=None, task=None, sender=None, **kwargs):
    if (sender.name == TASK_FINISH):
        return

    status = TASK_MESSAGES.get(sender.name, DEFAULT_MESSAGE)
    r.publish("ws_events", json.dumps({
        "task_id": kwargs["args"][0]["task_id"],
        "message": json.dumps({"status":status, "data":None})
    }))

def run_audio_pipeline(task_id, audio_file_path):
    print("RUN AUDIO PIPELINE")
    initial_payload = {"task_id": task_id, "data": None, "audio_filepath": audio_file_path}
    chain(
        stt_task.s(initial_payload),
        upload_lecture_task.s(),
        finish_task.s()
    ).apply_async()

async def ws_event_listener():
    redis = RedisAsync(host="redis", port=config.REDIS_PORT, db=0, decode_responses=True)
    pubsub = redis.pubsub()
    await pubsub.subscribe("ws_events")
    async for message in pubsub.listen():
        print(f"📩 Redis received: {message}")
        if message["type"] == "message":
            data = json.loads(message["data"])
            print(f"📨 Forwarding to WS: {data}")
            await manager.send_message(data["task_id"], data["message"])