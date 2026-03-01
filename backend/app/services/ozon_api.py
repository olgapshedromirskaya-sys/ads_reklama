from __future__ import annotations

import asyncio
from collections.abc import Sequence
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.exceptions import MarketplaceAPIError, MarketplaceAuthError


class OzonApiClient:
    def __init__(self, client_id: str, api_key: str, timeout: float = 40.0) -> None:
        settings = get_settings()
        self.base_url = settings.ozon_api_base_url.rstrip("/")
        self.timeout = timeout
        self.headers = {"Client-Id": client_id, "Api-Key": api_key}
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout, headers=self.headers)

    async def aclose(self) -> None:
        await self.client.aclose()

    async def __aenter__(self) -> "OzonApiClient":
        return self

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        await self.aclose()

    async def _request(self, method: str, url: str, *, json: Any = None, max_retries: int = 4) -> Any:
        backoff = 1.0
        for attempt in range(1, max_retries + 1):
            response = await self.client.request(method, url, json=json)

            if response.status_code in (401, 403):
                raise MarketplaceAuthError("Ozon API credentials are invalid or expired")

            if response.status_code == 429 and attempt < max_retries:
                await asyncio.sleep(backoff)
                backoff *= 2
                continue

            if response.status_code >= 400:
                raise MarketplaceAPIError(f"Ozon API error {response.status_code}: {response.text[:300]}")

            if not response.content:
                return {}
            return response.json()
        raise MarketplaceAPIError("Ozon API retries exhausted")

    async def get_campaigns(self) -> Any:
        return await self._request("GET", "/api/client/campaign")

    async def get_statistics(self, campaign_ids: Sequence[str | int], from_date: str, to_date: str) -> Any:
        payload = {
            "campaigns": [int(campaign_id) for campaign_id in campaign_ids],
            "date_from": from_date,
            "date_to": to_date,
        }
        return await self._request("POST", "/api/client/statistics", json=payload)

    async def get_search_phrases(self, campaign_id: str | int, from_date: str, to_date: str) -> Any:
        payload = {
            "campaign_id": int(campaign_id),
            "date_from": from_date,
            "date_to": to_date,
        }
        return await self._request("POST", "/api/client/statistics/search-phrases", json=payload)

    async def activate_campaign(self, campaign_id: str | int) -> Any:
        return await self._request("POST", "/api/client/campaign/activate", json={"campaign_id": int(campaign_id)})

    async def deactivate_campaign(self, campaign_id: str | int) -> Any:
        return await self._request("POST", "/api/client/campaign/deactivate", json={"campaign_id": int(campaign_id)})

    async def add_negative_keywords(self, campaign_id: str | int, keywords: Sequence[str]) -> Any:
        cleaned_keywords = sorted({word.strip() for word in keywords if word and word.strip()})
        if not cleaned_keywords:
            return {"applied": 0}

        payload_candidates = [
            (
                "/api/client/campaign/negative-keywords/update",
                {"campaign_id": int(campaign_id), "keywords": cleaned_keywords},
            ),
            (
                "/api/client/campaign/keywords/negative/add",
                {"campaign_id": int(campaign_id), "negative_keywords": cleaned_keywords},
            ),
            (
                "/api/client/campaign/keywords/update",
                {"campaign_id": int(campaign_id), "minus_keywords": cleaned_keywords},
            ),
        ]

        last_error: MarketplaceAPIError | None = None
        for endpoint, payload in payload_candidates:
            try:
                return await self._request("POST", endpoint, json=payload)
            except MarketplaceAPIError as exc:
                last_error = exc
                if " 404" in str(exc):
                    continue
                raise

        if last_error is not None:
            raise last_error
        return {"applied": len(cleaned_keywords)}
