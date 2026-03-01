# MP Ads Manager (Telegram Mini App + Bot)

Production-oriented starter for marketplace ad analytics:

- **Backend**: FastAPI + PostgreSQL + Redis + Celery
- **Bot**: `python-telegram-bot` v20 (async)
- **Frontend**: React + TypeScript + Tailwind (Telegram WebApp)
- **Infra**: Docker Compose + Alembic

## Implemented scope

### Backend
- Telegram WebApp auth (`initData` HMAC validation)
- JWT session issuance for frontend API calls
- Multi-account marketplace connections (WB + Ozon)
- Campaign, stats, search query storage schema
- Query relevance labels and bulk update
- Minus words generation (pymorphy2-based)
- XLSX export for query analytics table
- Budget rules and alert creation
- Keyword watchlist + position history storage
- Manual account refresh endpoint

### Marketplace integrations
- Wildberries API client with:
  - Bearer auth
  - Redis token bucket limiter (1 req/sec per account)
  - Exponential backoff on 429
- Ozon Performance API client with:
  - Client-Id / Api-Key auth
  - Exponential backoff on 429

### Background jobs (Celery Beat)
- Hourly: sync campaigns and campaign stats
- Every 3 hours: sync search queries
- Every 30 min: evaluate budget rules and alerts
- Daily 06:00: sync keyword positions (placeholder pipeline)
- Daily 09:00: send Telegram daily summaries

### Telegram bot commands
- `/start`
- `/dashboard`
- `/summary`
- `/alerts`
- `/campaigns`
- `/pause <campaign_id>`
- `/resume <campaign_id>`

### Frontend routes
- `/` dashboard
- `/campaigns`
- `/campaigns/:id`
- `/queries` (**main relevancy workspace**)
- `/keywords`
- `/budget`
- `/alerts`
- `/settings`

## Run locally with Docker

1. Copy environment:
   ```bash
   cp .env.example .env
   ```
2. Set at minimum:
   - `TELEGRAM_BOT_TOKEN`
   - `SECRET_KEY`
   - `WEBAPP_URL` (public URL for Telegram WebApp)
   - `ALLOWED_ORIGINS`
3. Start stack:
   ```bash
   docker compose up --build
   ```

Services:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`
- FastAPI docs: `http://localhost:8000/docs`

## Development notes

- Alembic migration runs on backend startup (`alembic upgrade head`).
- Frontend auth expects Telegram `initData` from the WebApp context.
- For local browser testing outside Telegram, pass `?initData=...` query string.
- Query relevancy defaults:
  - `CTR < 1%` and `impressions > 300` -> auto likely irrelevant
  - `CTR > 3%` or `orders > 0` -> auto likely relevant
  - otherwise -> pending

## Project tree

```text
backend/
  app/
    core/
    models/
    routers/
    schemas/
    services/
    tasks/
  bot/
  alembic/
frontend/
docker-compose.yml
```
