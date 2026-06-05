import json
from typing import Any

from redis_client import get_redis


async def cache_get(key: str) -> Any | None:
    redis = get_redis()
    value = await redis.get(key)
    if value is None:
        return None
    return json.loads(value)


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    redis = get_redis()
    await redis.setex(key, ttl, json.dumps(value, default=str))


async def cache_delete(key: str) -> None:
    redis = get_redis()
    await redis.delete(key)
