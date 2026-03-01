from functools import lru_cache

from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.config import get_settings


@lru_cache
def get_redis_sync() -> Redis:
    settings = get_settings()
    return Redis.from_url(settings.redis_url, decode_responses=True)


@lru_cache
def get_redis_async() -> AsyncRedis:
    settings = get_settings()
    return AsyncRedis.from_url(settings.redis_url, decode_responses=True)
