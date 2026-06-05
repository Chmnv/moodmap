export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};

export interface SpotifyUser {
  id: number;
  spotify_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface TopTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  image_url: string | null;
  duration_ms: number;
  popularity: number;
  external_url: string;
}

export interface TopArtist {
  id: string;
  name: string;
  genres: string[];
  image_url: string | null;
  popularity: number;
  followers: number;
  external_url: string;
}

export interface GenreCount {
  genre: string;
  count: number;
}

export interface HourCount {
  hour: number;
  count: number;
}
