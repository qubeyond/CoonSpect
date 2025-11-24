from redis.asyncio import Redis as RedisAsync
from redis import Redis as RedisSync
from celery import Celery, chain
from celery.signals import task_prerun
import json

import config
from src.wsmanager import manager

TASK_MESSAGES = {
    "src.celery_app.stt_task": "stt",
    "src.celery_app.rag_task": "rag",
    "src.celery_app.llm_task": "llm",
    "src.celery_app.upload_lecture_task": "saving",
    "src.celery_app.finish_task": "finish"
}
DEFAULT_MESSAGE = "unknown"

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
    """
    with open(payload["data"], "rb") as f:
        response = requests.post(
            config.STT_SERVICE_URL+"/transcribe",
            headers = {"task_id": payload["task_id"]},
            files = {f"audio": f},
            timeout = 1800
        )
    
    os.remove(payload["data"])
    response.raise_for_status()

    return {
        "task_id": payload["task_id"],
        "data": response.json()["text"]
    }"""
    print("stt")
    return {
        "task_id": payload["task_id"],
        "data": "hello world"
    }

@celery.task()
def upload_lecture_task(payload: dict):
    print("upload")
    return {
        "task_id": payload["task_id"],
        "data": 0
    }

@celery.task()
def finish_task(payload: dict):
    print("finish")
    r.publish("ws_events", json.dumps({
        "task_id": payload["task_id"],
        "message": payload["data"]
    }))

@task_prerun.connect
def track_task(task_id=None, task=None, sender=None, **kwargs):
    print(f"id {task_id}")
    print(f"task {task}")
    print(f"sender {sender}")
    print(f"kwargs {kwargs}")
    status = TASK_MESSAGES.get(sender.name, DEFAULT_MESSAGE)
    r.publish("ws_events", json.dumps({
        "task_id": kwargs["args"][0]["task_id"],
        "message": status
    }))

def run_audio_pipeline(task_id, audio_file_path):
    print("pre run")
    initial_payload = {"task_id": task_id, "data": audio_file_path}
    chain(
        stt_task.s(initial_payload),
        upload_lecture_task.s(),
        finish_task.s()
    ).apply_async()
    print("vot run")

async def ws_event_listener():
    redis = RedisAsync(host="redis", port=config.REDIS_PORT, db=0, decode_responses=True)
    pubsub = redis.pubsub()
    await pubsub.subscribe("ws_events")
    async for message in pubsub.listen():
        print(f"📩 Redis received: {message}")  # ← увидите содержимое
        if message["type"] == "message":
            data = json.loads(message["data"])
            print(f"📨 Forwarding to WS: {data}")
            await manager.send_message(data["task_id"], data["message"])