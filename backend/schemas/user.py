from datetime import datetime

from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    spotify_id: str
    email: str | None
    display_name: str | None
    avatar_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
