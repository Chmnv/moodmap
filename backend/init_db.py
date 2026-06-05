"""
Run once to create all database tables.
Usage:
    cd backend
    python init_db.py
"""

import asyncio

from database import create_tables
import models  # noqa: F401 — registers all ORM models with Base.metadata


async def main() -> None:
    print("Creating database tables...")
    await create_tables()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
