FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 & API_PID=$!; python -m bot.main & BOT_PID=$!; trap 'kill -TERM $API_PID $BOT_PID 2>/dev/null' INT TERM; while kill -0 $API_PID 2>/dev/null && kill -0 $BOT_PID 2>/dev/null; do sleep 1; done; if kill -0 $API_PID 2>/dev/null; then wait $BOT_PID; EXIT_CODE=$?; else wait $API_PID; EXIT_CODE=$?; fi; kill -TERM $API_PID $BOT_PID 2>/dev/null || true; wait $API_PID $BOT_PID 2>/dev/null || true; exit $EXIT_CODE"]
