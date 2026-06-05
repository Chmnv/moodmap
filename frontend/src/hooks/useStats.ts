import { useEffect, useState } from 'react';
import * as api from '../api/spotify';
import type { GenreCount, HourCount, TimeRange, TopArtist, TopTrack } from '../types/spotify';

interface StatsState {
  topTracks: TopTrack[];
  topArtists: TopArtist[];
  genres: GenreCount[];
  listeningHours: HourCount[];
  loading: boolean;
  genresLoading: boolean;
  error: string | null;
}

export function useStats(timeRange: TimeRange = 'medium_term'): StatsState {
  const [state, setState] = useState<StatsState>({
    topTracks: [],
    topArtists: [],
    genres: [],
    listeningHours: [],
    loading: true,
    genresLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, genresLoading: true, error: null }));

    // Load core stats first, genres separately (MusicBrainz lookup is slower)
    Promise.all([
      api.getTopTracks(timeRange),
      api.getTopArtists(timeRange),
      api.getListeningHours(),
    ])
      .then(([topTracks, topArtists, listeningHours]) => {
        if (!cancelled) {
          setState((s) => ({ ...s, topTracks, topArtists, listeningHours, loading: false, error: null }));
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: err.message ?? 'Failed to load stats' }));
        }
      });

    api.getGenres(timeRange)
      .then((genres) => {
        if (!cancelled) {
          setState((s) => ({ ...s, genres, genresLoading: false }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((s) => ({ ...s, genresLoading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  return state;
}
