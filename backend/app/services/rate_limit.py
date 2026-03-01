import asyncio
import random
import time

from redis.asyncio import Redis


class RedisTokenBucketLimiter:
    def __init__(self, redis: Redis, capacity: float = 1.0, refill_rate: float = 1.0) -> None:
        self.redis = redis
        self.capacity = capacity
        self.refill_rate = refill_rate

    async def acquire(self, key: str, amount: float = 1.0) -> None:
        while True:
            now = time.time()
            data = await self.redis.hgetall(key)
            tokens = float(data.get("tokens", self.capacity))
            last_refill = float(data.get("last_refill", now))

            elapsed = max(0.0, now - last_refill)
            tokens = min(self.capacity, tokens + elapsed * self.refill_rate)

            if tokens >= amount:
                tokens -= amount
                await self.redis.hset(
                    key,
                    mapping={
                        "tokens": tokens,
                        "last_refill": now,
                    },
                )
                await self.redis.expire(key, 120)
                return

            wait_seconds = max(0.05, (amount - tokens) / self.refill_rate)
            await self.redis.hset(key, mapping={"tokens": tokens, "last_refill": now})
            await self.redis.expire(key, 120)
            await asyncio.sleep(wait_seconds + random.uniform(0.01, 0.08))
