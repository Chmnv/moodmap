import base64
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from config import get_settings

settings = get_settings()

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"
SCOPES = " ".join([
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
])


def build_auth_url(state: str) -> str:
    params = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "scope": SCOPES,
        "state": state,
        "show_dialog": "false",
    }
    return f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"


def _basic_auth_header() -> str:
    credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
    return "Basic " + base64.b64encode(credentials.encode()).decode()


def _bearer_header(access_token: str) -> dict:
    return {"Authorization": f"Bearer {access_token}"}


def _raise_spotify_error(response: httpx.Response) -> None:
    try:
        detail = response.json().get("error", {}).get("message", response.text)
    except Exception:
        detail = response.text
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Spotify API error {response.status_code}: {detail}",
    )


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            headers={
                "Authorization": _basic_auth_header(),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.spotify_redirect_uri,
            },
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            headers={
                "Authorization": _basic_auth_header(),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()


async def get_user_profile(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE}/me",
            headers=_bearer_header(access_token),
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()


async def get_top_tracks(
    access_token: str,
    time_range: str = "medium_term",
    limit: int = 20,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE}/me/top/tracks",
            headers=_bearer_header(access_token),
            params={"time_range": time_range, "limit": limit},
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()


async def get_top_artists(
    access_token: str,
    time_range: str = "medium_term",
    limit: int = 20,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE}/me/top/artists",
            headers=_bearer_header(access_token),
            params={"time_range": time_range, "limit": limit},
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()


async def get_artists_by_ids(access_token: str, artist_ids: list[str]) -> dict:
    """Batch-fetch up to 50 artists in a single request (includes genres)."""
    ids_param = ",".join(artist_ids[:50])
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE}/artists",
            headers=_bearer_header(access_token),
            params={"ids": ids_param},
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()


async def get_recently_played(
    access_token: str,
    limit: int = 50,
) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_BASE}/me/player/recently-played",
            headers=_bearer_header(access_token),
            params={"limit": limit},
        )
    if response.status_code != 200:
        _raise_spotify_error(response)
    return response.json()
