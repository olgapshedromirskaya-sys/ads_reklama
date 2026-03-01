import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import alerts, auth, budget, campaigns, keywords, queries

logger = logging.getLogger(__name__)
settings = get_settings()


def _normalize_api_prefix(raw_prefix: str) -> str:
    normalized = (raw_prefix or "").strip()
    if normalized and not normalized.startswith("/"):
        normalized = f"/{normalized}"
    normalized = normalized.rstrip("/")
    return normalized or "/api"


api_prefix = _normalize_api_prefix(settings.api_prefix)
router_prefixes = list(dict.fromkeys([api_prefix, "/api"]))

required_cors_origins = [
    "https://ads-reklama-frontend.onrender.com",
    "https://web.telegram.org",
    "*",
]
allowed_origins = list(dict.fromkeys([*settings.allowed_origins, *required_cors_origins]))

app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router_prefix in router_prefixes:
    app.include_router(auth.router, prefix=router_prefix)
    app.include_router(campaigns.router, prefix=router_prefix)
    app.include_router(queries.router, prefix=router_prefix)
    app.include_router(keywords.router, prefix=router_prefix)
    app.include_router(budget.router, prefix=router_prefix)
    app.include_router(alerts.router, prefix=router_prefix)

logger.info("Mounted API routers with prefixes: %s", router_prefixes)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
