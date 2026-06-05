import type { TimeRange } from '../types/spotify';
import { TIME_RANGE_LABELS } from '../types/spotify';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const TIME_RANGES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

export default function Navbar({ timeRange, onTimeRangeChange }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-spotify-black/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-6 h-6 text-spotify-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="font-bold text-white text-lg">Moodmap</span>
        </div>

        {/* Time range tabs */}
        <div className="flex items-center bg-spotify-dark rounded-lg p-1 gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                timeRange === range
                  ? 'bg-white text-black'
                  : 'text-spotify-text-secondary hover:text-white'
              }`}
            >
              {TIME_RANGE_LABELS[range]}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.display_name ?? ''} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-spotify-hover flex items-center justify-center">
              <svg className="w-4 h-4 text-spotify-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          )}
          <span className="text-white text-sm font-medium hidden sm:block">{user?.display_name ?? 'User'}</span>
          <button
            onClick={logout}
            className="text-spotify-text-secondary hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-spotify-hover"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
