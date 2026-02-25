# CoonSpect

# Run project

1. Env Config

```bash
cp .env.example .env
```

2. Run with mocks:

```bash
docker compose --profile mock up -d --build
```

3. Run with real ML services (GPU required):

Open `.env` and update STT_SERVICE_URL and LLM_SERVICE_URL to point to the real services.

```bash
docker-compose --profile ml up -d --build
```

