from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401 — side-effect import registers ORM models with Base.metadata
from config import get_settings
from database import create_tables
from redis_client import close_redis
from routers import auth, stats

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield
    await close_redis()


app = FastAPI(
    title="Moodmap API",
    description="Spotify Stats Visualizer — backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok"}
