import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.user import User
from redis_client import get_redis
from schemas.user import UserOut
from services import spotify as spotify_svc

settings = get_settings()
router = APIRouter()

# auto_error=False so we can return a clean 401 instead of FastAPI's default 403
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

_STATE_TTL = 600  # seconds — Spotify OAuth state lives 10 minutes in Redis


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_jwt(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


# ---------------------------------------------------------------------------
# Reusable dependency — resolves the current user from JWT
# Imported by stats router and any future protected router.
# ---------------------------------------------------------------------------

async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Auto-refresh Spotify access_token when it expires within 5 minutes
    if user.token_expires_at and user.refresh_token:
        buffer = datetime.now(timezone.utc) + timedelta(minutes=5)
        expires = user.token_expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires <= buffer:
            data = await spotify_svc.refresh_access_token(user.refresh_token)
            user.access_token = data["access_token"]
            user.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))
            if "refresh_token" in data:
                user.refresh_token = data["refresh_token"]
            await db.commit()
            await db.refresh(user)

    return user


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/login", summary="Redirect to Spotify OAuth consent screen")
async def login() -> RedirectResponse:
    state = secrets.token_hex(16)
    redis = get_redis()
    await redis.setex(f"oauth_state:{state}", _STATE_TTL, "1")
    return RedirectResponse(url=spotify_svc.build_auth_url(state))


@router.get("/callback", summary="Spotify OAuth callback — exchanges code and issues JWT")
async def callback(
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    # Spotify sends ?error=access_denied when the user clicks "Cancel"
    if error:
        return RedirectResponse(url=f"{settings.frontend_url}/?error={error}")

    if not code:
        return RedirectResponse(url=f"{settings.frontend_url}/?error=missing_code")

    if not state:
        return RedirectResponse(url=f"{settings.frontend_url}/?error=missing_state")

    # Verify CSRF state stored in Redis
    redis = get_redis()
    state_key = f"oauth_state:{state}"
    stored = await redis.get(state_key)
    if not stored:
        return RedirectResponse(url=f"{settings.frontend_url}/?error=invalid_state")
    await redis.delete(state_key)

    # Exchange code → Spotify tokens
    token_data = await spotify_svc.exchange_code(code)
    access_token = token_data["access_token"]
    refresh_token_val = token_data.get("refresh_token")
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_data.get("expires_in", 3600))

    # Fetch Spotify profile
    profile = await spotify_svc.get_user_profile(access_token)
    spotify_id: str = profile["id"]
    avatar_url: str | None = ((profile.get("images") or [{}])[0]).get("url")

    # Upsert user in PostgreSQL
    result = await db.execute(select(User).where(User.spotify_id == spotify_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(spotify_id=spotify_id)
        db.add(user)

    user.email = profile.get("email")
    user.display_name = profile.get("display_name")
    user.avatar_url = avatar_url
    user.access_token = access_token
    user.refresh_token = refresh_token_val
    user.token_expires_at = expires_at

    await db.commit()
    await db.refresh(user)

    jwt_token = create_jwt(user.id)
    return RedirectResponse(url=f"{settings.frontend_url}/callback?token={jwt_token}")


@router.get("/logout", summary="Invalidate session on the client side")
async def logout() -> dict:
    # JWT is stateless — the frontend discards the token.
    # For server-side invalidation a Redis denylist can be added later.
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut, summary="Return current authenticated user's profile")
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
