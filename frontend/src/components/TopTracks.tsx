import type { TopTrack } from '../types/spotify';

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

interface TopTracksProps {
  tracks: TopTrack[];
}

export default function TopTracks({ tracks }: TopTracksProps) {
  if (tracks.length === 0) {
    return (
      <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-6 flex items-center justify-center h-40 border border-spotify-border/30 shadow-xl shadow-black/20">
        <p className="text-spotify-text-secondary">No track data available</p>
      </div>
    );
  }

  return (
    <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-5 border border-spotify-border/30 shadow-xl shadow-black/20 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-base">Top Tracks</h2>
        <button className="text-spotify-green text-xs font-semibold hover:underline">View all</button>
      </div>
      <div className="space-y-0.5">
        {tracks.slice(0, 6).map((track, i) => (
          <a
            key={track.id}
            href={track.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-spotify-hover/50 transition-colors group"
          >
            <span className="text-spotify-text-muted text-sm w-4 text-right flex-shrink-0 font-medium tabular-nums">
              {i + 1}
            </span>
            {track.image_url ? (
              <img
                src={track.image_url}
                alt={track.album}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-spotify-hover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-spotify-green transition-colors">
                {track.name}
              </p>
              <p className="text-spotify-text-muted text-xs truncate">{track.artists.join(', ')}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:block w-16">
                <div className="h-1 rounded-full bg-spotify-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-spotify-green"
                    style={{ width: `${Math.max(track.popularity, 10)}%` }}
                  />
                </div>
              </div>
              <span className="text-spotify-text-muted text-xs tabular-nums w-10 text-right">
                {formatDuration(track.duration_ms)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
