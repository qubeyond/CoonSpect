.PHONY: lint format test run up migrate

# Проверка линтерами
lint:
	uv run ruff check .
	uv run mypy .

# Форматирование кода
format:
	uv run ruff check . --fix --unsafe-fixes
	uv run ruff format .

# Запуск тестов
test:
	uv run pytest

# Применить миграции
migrate:
	uv run alembic upgrade head

# Запуск (аналог start.sh)
up: migrate
	uv run celery -A src.app.celery_app worker --loglevel=info &
	uv run uvicorn src.app.main:app --host 0.0.0.0 --port 8000