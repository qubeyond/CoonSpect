import os

# Redis configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_URL = os.getenv('REDIS_URL', f'redis://{REDIS_HOST}:{REDIS_PORT}')

# Database
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg2://user:pwd1234@db:5432/coonspect')

# STT Service
STT_SERVICE_URL = os.getenv('STT_SERVICE_URL', "http://stt-service:8000/transcribe")