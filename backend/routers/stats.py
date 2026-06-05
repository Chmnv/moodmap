import logging

from fastapi import APIRouter, Depends, Query

from models.user import User
from routers.auth import get_current_user
from services import cache as cache_svc
from services import musicbrainz as mb_svc
from services import spotify as spotify_svc

router = APIRouter()
log = logging.getLogger(__name__)

CACHE_TTL = 300  # 5 minutes


@router.get("/top-tracks", summary="Top tracks for the current user")
async def top_tracks(
    time_range: str = Query("medium_term", enum=["short_term", "medium_term", "long_term"]),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    cache_key = f"top_tracks:{current_user.id}:{time_range}:{limit}"
    cached = await cache_svc.cache_get(cache_key)
    if cached is not None:
        return cached

    data = await spotify_svc.get_top_tracks(current_user.access_token, time_range, limit)
    items = data.get("items", [])

    if items:
        log.debug("TRACK SAMPLE keys: %s", list(items[0].keys()))

    result = [
        {
            "id": track.get("id", ""),
            "name": track.get("name", "Unknown"),
            "artists": [a["name"] for a in track.get("artists", [])],
            "album": (track.get("album") or {}).get("name", ""),
            "image_url": (((track.get("album") or {}).get("images") or [{}])[0]).get("url"),
            "duration_ms": track.get("duration_ms", 0),
            "popularity": track.get("popularity", 0),
            "external_url": (track.get("external_urls") or {}).get("spotify", ""),
        }
        for track in items
    ]
    if result:
        await cache_svc.cache_set(cache_key, result, CACHE_TTL)
    return result


@router.get("/top-artists", summary="Top artists for the current user")
async def top_artists(
    time_range: str = Query("medium_term", enum=["short_term", "medium_term", "long_term"]),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    cache_key = f"top_artists:{current_user.id}:{time_range}:{limit}"
    cached = await cache_svc.cache_get(cache_key)
    if cached is not None:
        return cached

    data = await spotify_svc.get_top_artists(current_user.access_token, time_range, limit)
    items = data.get("items", [])

    if items:
        log.debug("ARTIST SAMPLE keys: %s", list(items[0].keys()))

    result = [
        {
            "id": artist.get("id", ""),
            "name": artist.get("name", "Unknown"),
            "genres": [g for g in artist.get("genres", []) if g and g.lower() != "unknown genre"],
            "image_url": ((artist.get("images") or [{}])[0]).get("url"),
            "popularity": artist.get("popularity", 0),
            "followers": (artist.get("followers") or {}).get("total", 0),
            "external_url": (artist.get("external_urls") or {}).get("spotify", ""),
        }
        for artist in items
    ]

    # Supplement missing followers via batch artist lookup
    missing_ids = [a["id"] for a in result if a["id"] and a["followers"] == 0]
    if missing_ids:
        try:
            batch = await spotify_svc.get_artists_by_ids(current_user.access_token, missing_ids)
            id_to_followers = {
                a["id"]: (a.get("followers") or {}).get("total", 0)
                for a in batch.get("artists", [])
                if a
            }
            for artist in result:
                if artist["followers"] == 0 and artist["id"] in id_to_followers:
                    artist["followers"] = id_to_followers[artist["id"]]
        except Exception as exc:
            log.warning("Batch artist lookup for followers failed: %s", exc)

    if result:
        await cache_svc.cache_set(cache_key, result, CACHE_TTL)
    return result


@router.get("/genres", summary="Genre distribution from user's top artists and top tracks")
async def genres(
    time_range: str = Query("medium_term", enum=["short_term", "medium_term", "long_term"]),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    cache_key = f"genres:{current_user.id}:{time_range}"
    cached = await cache_svc.cache_get(cache_key)
    if cached is not None:
        return cached

    # Collect unique artist names from top artists + top tracks
    top_artists_data = await spotify_svc.get_top_artists(current_user.access_token, time_range, limit=50)
    artist_names: list[str] = []
    seen: set[str] = set()
    for a in top_artists_data.get("items", []):
        name = a.get("name")
        if name and name not in seen:
            artist_names.append(name)
            seen.add(name)

    top_tracks_data = await spotify_svc.get_top_tracks(current_user.access_token, time_range, limit=50)
    for track in top_tracks_data.get("items", []):
        for a in track.get("artists", []):
            name = a.get("name")
            if name and name not in seen:
                artist_names.append(name)
                seen.add(name)

    # Spotify removed genres from their API (Feb 2026) — use MusicBrainz
    genres_map = await mb_svc.get_genres_for_artists(artist_names[:20])

    genre_counts: dict[str, int] = {}
    for tags in genres_map.values():
        for g in tags[:3]:
            if g and g.lower() not in ("unknown genre", "unknown"):
                genre_counts[g] = genre_counts.get(g, 0) + 1

    result = sorted(
        [{"genre": g, "count": c} for g, c in genre_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:15]

    if result:
        await cache_svc.cache_set(cache_key, result, CACHE_TTL)
    return result



@router.get("/listening-hours", summary="Listening activity broken down by hour of day (0-23)")
async def listening_hours(
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    cache_key = f"listening_hours:{current_user.id}"
    cached = await cache_svc.cache_get(cache_key)
    if cached is not None:
        return cached

    data = await spotify_svc.get_recently_played(current_user.access_token, limit=50)
    hour_counts = [0] * 24
    for item in data.get("items", []):
        played_at: str = item.get("played_at", "")
        if len(played_at) >= 13:
            try:
                hour = int(played_at[11:13])
                hour_counts[hour] += 1
            except ValueError:
                pass

    result = [{"hour": h, "count": hour_counts[h]} for h in range(24)]
    await cache_svc.cache_set(cache_key, result, CACHE_TTL)
    return result
