from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import alerts, auth, budget, campaigns, keywords, queries

settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(campaigns.router, prefix=settings.api_prefix)
app.include_router(queries.router, prefix=settings.api_prefix)
app.include_router(keywords.router, prefix=settings.api_prefix)
app.include_router(budget.router, prefix=settings.api_prefix)
app.include_router(alerts.router, prefix=settings.api_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
