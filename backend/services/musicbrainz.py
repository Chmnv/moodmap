"""Fetch artist genres/tags from MusicBrainz (free, no API key required).

MusicBrainz rate limit: 1 req/sec per IP.
Results are cached per-artist in Redis for 24 hours.
"""

import asyncio
import logging
import time

import httpx

from services import cache as cache_svc

log = logging.getLogger(__name__)

_BASE = "https://musicbrainz.org/ws/2"
_UA = "Moodmap/1.0 (https://github.com/moodmap)"
_ARTIST_CACHE_TTL = 86_400  # 24 hours

_lock = asyncio.Lock()
_last_req: float = 0


async def _rate_limited_get(client: httpx.AsyncClient, url: str, **kwargs) -> httpx.Response:
    global _last_req
    async with _lock:
        now = time.monotonic()
        wait = max(0.0, 1.05 - (now - _last_req))
        if wait:
            await asyncio.sleep(wait)
        resp = await client.get(url, **kwargs)
        _last_req = time.monotonic()
        return resp


async def _lookup_genres(client: httpx.AsyncClient, artist_name: str) -> list[str]:
    """Search MusicBrainz for *artist_name* and return its top tags."""
    resp = await _rate_limited_get(
        client,
        f"{_BASE}/artist",
        params={"query": f'artist:"{artist_name}"', "fmt": "json", "limit": 1},
        headers={"User-Agent": _UA},
    )
    if resp.status_code != 200:
        log.debug("MusicBrainz %s for '%s'", resp.status_code, artist_name)
        return []

    artists = resp.json().get("artists", [])
    if not artists:
        return []

    tags = artists[0].get("tags") or []
    return [
        t["name"]
        for t in sorted(tags, key=lambda t: t.get("count", 0), reverse=True)
        if t.get("count", 0) > 0
    ]


async def _get_artist_genres(client: httpx.AsyncClient, artist_name: str) -> list[str]:
    """Return cached or freshly-fetched genres for a single artist."""
    cache_key = f"mb_genres:{artist_name.lower()}"
    cached = await cache_svc.cache_get(cache_key)
    if cached is not None:
        return cached

    genres = await _lookup_genres(client, artist_name)
    await cache_svc.cache_set(cache_key, genres, _ARTIST_CACHE_TTL)
    return genres


async def get_genres_for_artists(artist_names: list[str]) -> dict[str, list[str]]:
    """Look up genres for a list of artists (respecting rate limit).

    Returns ``{artist_name: [genre, ...]}`` mapping.
    Cached artists return instantly; only cache-misses hit the network.
    """
    out: dict[str, list[str]] = {}
    async with httpx.AsyncClient(timeout=10) as client:
        for name in artist_names:
            try:
                out[name] = await _get_artist_genres(client, name)
            except Exception as exc:
                log.warning("MusicBrainz lookup failed for '%s': %s", name, exc)
                out[name] = []
    return out
