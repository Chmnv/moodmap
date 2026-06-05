import type { GenreCount, HourCount, SpotifyUser, TimeRange, TopArtist, TopTrack } from '../types/spotify';
import client from './client';

export const getMe = (): Promise<SpotifyUser> =>
  client.get<SpotifyUser>('/auth/me').then((r) => r.data);

export const getTopTracks = (time_range: TimeRange = 'medium_term', limit = 20): Promise<TopTrack[]> =>
  client.get<TopTrack[]>('/stats/top-tracks', { params: { time_range, limit } }).then((r) => r.data);

export const getTopArtists = (time_range: TimeRange = 'medium_term', limit = 20): Promise<TopArtist[]> =>
  client.get<TopArtist[]>('/stats/top-artists', { params: { time_range, limit } }).then((r) => r.data);

export const getGenres = (time_range: TimeRange = 'medium_term'): Promise<GenreCount[]> =>
  client.get<GenreCount[]>('/stats/genres', { params: { time_range } }).then((r) => r.data);

export const getListeningHours = (): Promise<HourCount[]> =>
  client.get<HourCount[]>('/stats/listening-hours').then((r) => r.data);
