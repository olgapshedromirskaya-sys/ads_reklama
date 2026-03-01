from __future__ import annotations

import asyncio
from collections.abc import Sequence
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.redis_client import get_redis_async
from app.services.exceptions import MarketplaceAPIError, MarketplaceAuthError
from app.services.rate_limit import RedisTokenBucketLimiter


class WBApiClient:
    def __init__(self, api_token: str, account_id: int, timeout: float = 40.0) -> None:
        settings = get_settings()
        self.base_url = settings.wb_api_base_url.rstrip("/")
        self.timeout = timeout
        self.account_id = account_id
        self.headers = {"Authorization": f"Bearer {api_token}"}
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout, headers=self.headers)
        self.rate_limiter = RedisTokenBucketLimiter(get_redis_async(), capacity=1.0, refill_rate=1.0)

    async def aclose(self) -> None:
        await self.client.aclose()

    async def __aenter__(self) -> "WBApiClient":
        return self

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        await self.aclose()

    async def _request(
        self,
        method: str,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
        max_retries: int = 5,
    ) -> Any:
        rate_key = f"wb:rl:{self.account_id}"
        backoff = 1.0

        for attempt in range(1, max_retries + 1):
            await self.rate_limiter.acquire(rate_key)
            response = await self.client.request(method, url, params=params, json=json)

            if response.status_code in (401, 403):
                raise MarketplaceAuthError("WB API credentials are invalid or expired")

            if response.status_code == 429 and attempt < max_retries:
                await asyncio.sleep(backoff)
                backoff *= 2
                continue

            if response.status_code >= 400:
                raise MarketplaceAPIError(f"WB API error {response.status_code}: {response.text[:300]}")

            if not response.content:
                return {}
            return response.json()

        raise MarketplaceAPIError("WB API rate limit retries exhausted")

    async def get_campaign_count(self) -> Any:
        return await self._request("GET", "/adv/v1/promotion/count")

    async def get_campaigns(self) -> Any:
        return await self._request("GET", "/adv/v1/promotion/adverts")

    async def get_full_stats(self, campaign_ids: Sequence[str | int], dates: list[str]) -> Any:
        payload = [{"id": int(campaign_id), "dates": dates} for campaign_id in campaign_ids]
        return await self._request("POST", "/adv/v2/fullstats", json=payload)

    async def get_search_query_stats(self, campaign_id: str | int, from_date: str, to_date: str) -> Any:
        payload = {
            "id": int(campaign_id),
            "from": from_date,
            "to": to_date,
        }
        return await self._request("POST", "/adv/v1/stat/words", json=payload)

    async def pause_campaign(self, campaign_id: str | int) -> Any:
        return await self._request("GET", "/adv/v0/pause", params={"id": int(campaign_id)})

    async def resume_campaign(self, campaign_id: str | int) -> Any:
        return await self._request("GET", "/adv/v0/start", params={"id": int(campaign_id)})
