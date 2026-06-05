import type { TopArtist } from '../types/spotify';

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface TopArtistsProps {
  artists: TopArtist[];
}

export default function TopArtists({ artists }: TopArtistsProps) {
  if (artists.length === 0) {
    return (
      <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-6 flex items-center justify-center h-40 border border-spotify-border/30 shadow-xl shadow-black/20">
        <p className="text-spotify-text-secondary">No artist data available</p>
      </div>
    );
  }

  return (
    <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-5 border border-spotify-border/30 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-base">Top Artists</h2>
        <button className="text-spotify-green text-xs font-semibold hover:underline">View all</button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {artists.slice(0, 10).map((artist) => (
          <a
            key={artist.id}
            href={artist.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center gap-2 p-2 rounded-xl hover:bg-spotify-hover/50 transition-colors"
          >
            {artist.image_url ? (
              <img
                src={artist.image_url}
                alt={artist.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-spotify-border group-hover:ring-spotify-green/50 transition-all shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-spotify-hover flex items-center justify-center">
                <svg className="w-6 h-6 text-spotify-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
            <div className="w-full min-w-0">
              <p className="text-white text-xs font-semibold truncate group-hover:text-spotify-green transition-colors">
                {artist.name}
              </p>
              {artist.followers != null && artist.followers > 0 && (
                <p className="text-spotify-text-muted text-[11px]">
                  {formatFollowers(artist.followers)} followers
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
