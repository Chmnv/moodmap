from pydantic import BaseModel


class TopTrack(BaseModel):
    id: str
    name: str
    artists: list[str]
    album: str
    image_url: str | None
    duration_ms: int
    popularity: int
    external_url: str


class TopArtist(BaseModel):
    id: str
    name: str
    genres: list[str]
    image_url: str | None
    popularity: int
    followers: int
    external_url: str


class GenreCount(BaseModel):
    genre: str
    count: int


class HourCount(BaseModel):
    hour: int
    count: int
