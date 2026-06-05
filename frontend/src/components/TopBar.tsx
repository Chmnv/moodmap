import type { TimeRange } from '../types/spotify';
import { TIME_RANGE_LABELS } from '../types/spotify';
import { useAuth } from '../hooks/useAuth';

interface TopBarProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const TIME_RANGES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

export default function TopBar({ timeRange, onTimeRangeChange }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-spotify-black/80 backdrop-blur-xl border-b border-spotify-border/50">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <svg className="w-7 h-7 text-spotify-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="font-bold text-white text-lg tracking-tight hidden sm:inline">Moodmap</span>
        </div>

        {/* Time range tabs — centered */}
        <div className="flex items-center bg-spotify-dark rounded-full p-1 gap-0.5 border border-spotify-border/50">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                timeRange === range
                  ? 'bg-white text-black shadow-sm'
                  : 'text-spotify-text-secondary hover:text-white'
              }`}
            >
              {TIME_RANGE_LABELS[range]}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* User avatar + logout */}
          <div className="flex items-center gap-2">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-spotify-border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-spotify-hover flex items-center justify-center">
                <svg className="w-4 h-4 text-spotify-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
            <button onClick={logout} className="text-spotify-text-muted hover:text-white transition-colors p-1 rounded" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
