# Mocks

Сервисы имитируют работу ML-модулей (STT и LLM) для локальной разработки и тестирования бэкенда без использования GPU.

## List

1. STT Mock 

- URL: `http://localhost:8001`
- Эндпоинт: `POST /transcribe` (`file=@...`)
- Вход: `multipart/form-data`
- Задержка: 1.5 сек 

2. LLM Mock 

- URL: `http://localhost:8002`
- Эндпоинт: `POST /summarize`
- Вход: `application/json` (`{"text": "..."}`)
- Задержка: 2.0 сек