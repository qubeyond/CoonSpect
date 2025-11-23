import redis
from celery import Celery, chain
from celery.signals import task_prerun
import requests
import os

import config
from src.wsmanager import manager

TASK_MESSAGES = {
    "stt_task": "stt",
    "rag_task": "rag",
    "llm_task": "llm",
    "upload_lecture_task": "saving",
    "finish_task": "finish"
}
DEFAULT_MESSAGE = "unknown"

r = redis.Redis(
    host = config.REDIS_URL,
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
async def stt_task(payload: dict):
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

    return {
        "task_id": payload["task_id"],
        "data": "hello world"
    }

@celery.task()
async def upload_lecture_task(payload: dict):
    return {
        "task_id": payload["task_id"],
        "data": 0
    }

@celery.task()
async def finish_task(payload: dict):
    manager.send_message(payload["task_id"], payload["data"])

@task_prerun.connect
def track_task(sender=None, task_id=None, retval=None, **kwargs):
    print(f"idk {sender}")
    status = TASK_MESSAGES.get(sender, DEFAULT_MESSAGE)
    if (retval != None):
        manager.send_message(retval["task_id"], status)
    else:
        print("[TRACK TASK]")

def run_audio_pipeline(task_id, audio_file_path):
    print("pre run")
    initial_payload = {"task_id": task_id, "data": audio_file_path}
    chain(
        stt_task.s(initial_payload),
        upload_lecture_task.s(),
        finish_task.s()
    ).apply_async()
    print("vot run")
