# Moodmap

A small dashboard for your Spotify listening habits. Log in with Spotify, pick a time range, and see your top tracks, artists, genres, and how much you've been listening lately.

I built this mostly for myself — wanted something cleaner than digging through Spotify Wrapped once a year.

## What you get

- **Top tracks & artists** — pulled straight from Spotify's top endpoints
- **Genre breakdown** — Spotify stopped returning genres on artist objects (yeah, thanks Spotify), so genres come from MusicBrainz instead. First load can take a few seconds while it looks artists up
- **Listening time chart** — rolling 7-day bar chart based on your recently played history. The rightmost bar is always today
- **Time ranges** — last 4 weeks, 6 months, or all time

The UI is dark, green accents, no sidebar clutter. Just the stats.

## Stack

**Frontend:** React, TypeScript, Vite, Tailwind, Recharts, Zustand

**Backend:** FastAPI, PostgreSQL, Redis, httpx for Spotify + MusicBrainz

Auth is Spotify OAuth → JWT on our side. Stats responses are cached in Redis for 5 minutes so you're not hammering the API on every tab switch.

## Before you start

You'll need:

- A [Spotify Developer](https://developer.spotify.com/dashboard) app
- PostgreSQL running locally (or wherever)
- Redis running locally
- Python 3.11+ and Node 18+

### Spotify app setup

Create an app in the Spotify dashboard and add this redirect URI:

```
http://127.0.0.1:8000/auth/callback
```

Copy the Client ID and Client Secret — you'll need them in `.env`.

Scopes used: `user-read-private`, `user-read-email`, `user-top-read`, `user-read-recently-played`

## Running locally

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# fill in .env with your credentials
```

Edit `backend/.env`:

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/auth/callback
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/moodmap
REDIS_URL=redis://localhost:6379
SECRET_KEY=pick_something_random_here
FRONTEND_URL=http://localhost:5173
```

Create the database (name it `moodmap` or whatever matches your URL), then:

```bash
python init_db.py   # optional — tables also get created on startup
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Then:

```bash
npm run dev
```

Open http://localhost:5173 and log in with Spotify.

## Project layout

```
Moodmap/
├── backend/
│   ├── routers/       # auth + stats endpoints
│   ├── services/      # spotify, musicbrainz, cache
│   └── models/        # user table (stores tokens)
└── frontend/
    └── src/
        ├── pages/     # Login, Dashboard, OAuth callback
        ├── components/
        └── hooks/     # useStats, useAuth
```

## API endpoints (the ones that matter)

| Endpoint | What it does |
|----------|-------------|
| `GET /auth/login` | Redirects to Spotify |
| `GET /auth/callback` | OAuth callback, returns JWT |
| `GET /stats/top-tracks` | Your top tracks |
| `GET /stats/top-artists` | Your top artists (with follower counts) |
| `GET /stats/genres` | Genre distribution via MusicBrainz |
| `GET /stats/listening-hours` | Hourly play counts from last 50 plays |

All `/stats/*` routes need a Bearer token.

## Notes / quirks

- **Genres are slow on first load.** MusicBrainz has a 1 req/sec rate limit and we cache results for 24h, so it gets better after the first visit.
- **Listening time is estimated.** We only get the last 50 recently played tracks from Spotify, not full play history. The chart distributes that across the last 7 days — good enough for a rough picture, not gospel.
- **Follower counts** — if Spotify's top artists endpoint returns 0, we do a batch lookup to fill them in.
- Redis is optional in theory but the app expects it for caching. Just run `redis-server` and you're fine.

## Building for production

```bash
# frontend
cd frontend && npm run build

# backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

Point `FRONTEND_URL` and `VITE_API_BASE_URL` at your real domains. Update the Spotify redirect URI to match your production callback URL.

---

If something breaks, check `/health` on the backend first. Nine times out of ten it's a missing `.env` value or Redis not running.
