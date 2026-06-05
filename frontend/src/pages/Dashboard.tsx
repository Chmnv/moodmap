import { useState } from 'react';
import GenreChart, { MiniGenreChart } from '../components/GenreChart';
import Layout from '../components/Layout';
import ListeningHeatmap from '../components/ListeningHeatmap';
import StatCard from '../components/StatCard';
import TopArtists from '../components/TopArtists';
import TopTracks from '../components/TopTracks';
import { useStats } from '../hooks/useStats';
import type { TimeRange } from '../types/spotify';

function LoadingGrid() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[120px] bg-spotify-card/60 backdrop-blur-md rounded-2xl border border-spotify-border/30 shadow-xl shadow-black/20" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-[380px] bg-spotify-card/60 backdrop-blur-md rounded-2xl border border-spotify-border/30 shadow-xl shadow-black/20" />
        <div className="lg:col-span-2 h-[380px] bg-spotify-card/60 backdrop-blur-md rounded-2xl border border-spotify-border/30 shadow-xl shadow-black/20" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 bg-spotify-card/60 backdrop-blur-md rounded-2xl border border-spotify-border/30 shadow-xl shadow-black/20" />
        <div className="h-64 bg-spotify-card/60 backdrop-blur-md rounded-2xl border border-spotify-border/30 shadow-xl shadow-black/20" />
      </div>
    </div>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  return n.toString();
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const { topTracks, topArtists, genres, listeningHours, loading, genresLoading, error } = useStats(timeRange);

  if (error) {
    return (
      <Layout timeRange={timeRange} onTimeRangeChange={setTimeRange}>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-red-400 font-medium">Failed to load your stats</p>
          <p className="text-spotify-text-secondary text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-spotify-green text-white rounded-full text-sm font-semibold hover:bg-spotify-green-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const topTrack = topTracks[0];
  const topArtist = topArtists[0];
  const topGenre = genres[0];
  const total = genres.reduce((sum, g) => sum + g.count, 0);

  return (
    <Layout timeRange={timeRange} onTimeRangeChange={setTimeRange}>
      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="space-y-5">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Top Track"
              value={topTrack?.name ?? '—'}
              sub={topTrack?.artists.join(', ')}
              variant="green"
              image={topTrack?.image_url}
              icon={
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-spotify-text-secondary">
                    {topTrack ? `${Math.floor(topTrack.duration_ms / 60000)}:${String(Math.floor((topTrack.duration_ms % 60000) / 1000)).padStart(2, '0')}` : ''}
                  </span>
                </div>
              }
            />
            <StatCard
              label="Top Artist"
              value={topArtist?.name ?? '—'}
              sub={topArtist && topArtist.followers > 0 ? `${formatFollowers(topArtist.followers)} followers` : undefined}
              variant="blue"
              image={topArtist?.image_url}
            />
            <StatCard
              label="Top Genre"
              value={topGenre?.genre ?? '—'}
              sub={topGenre ? `${topGenre.count} artists \u2022 ${total > 0 ? ((topGenre.count / total) * 100).toFixed(0) : 0}%` : undefined}
              miniChart={genres.length > 0 ? <MiniGenreChart genres={genres} /> : undefined}
            />
          </div>

          {/* Tracks + Genre Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <TopTracks tracks={topTracks} />
            </div>
            <div className="lg:col-span-2">
              <GenreChart genres={genres} loading={genresLoading} />
            </div>
          </div>

          {/* Top Artists + Listening Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopArtists artists={topArtists} />
            <ListeningHeatmap data={listeningHours} />
          </div>
        </div>
      )}
    </Layout>
  );
}
