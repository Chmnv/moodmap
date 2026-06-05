import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { GenreCount } from '../types/spotify';

const COLORS = [
  '#1DB954', '#1ed760', '#17a349', '#148a3d',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#14b8a6', '#06b6d4', '#64748b',
];

interface GenreChartProps {
  genres: GenreCount[];
  loading?: boolean;
}

export default function GenreChart({ genres, loading }: GenreChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading || genres.length === 0) {
    return (
      <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-5 h-full flex flex-col justify-center items-center gap-3 min-h-[340px] border border-spotify-border/30 shadow-xl shadow-black/20">
        {loading ? (
          <>
            <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-semibold text-sm">Analyzing genres...</p>
            <p className="text-spotify-text-secondary text-xs text-center max-w-[220px]">
              Fetching genre data from MusicBrainz (first load may take a moment)
            </p>
          </>
        ) : (
          <>
            <svg className="w-10 h-10 text-spotify-hover" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <p className="text-white font-semibold text-sm">No genre tags found</p>
            <p className="text-spotify-text-secondary text-xs text-center max-w-[200px]">
              Genre data is not available for your top artists.
            </p>
          </>
        )}
      </div>
    );
  }

  const sorted = [...genres].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, g) => sum + g.count, 0);
  const topGenres = sorted.slice(0, 10);
  const otherCount = sorted.slice(10).reduce((sum, g) => sum + g.count, 0);
  const chartData = otherCount > 0 ? [...topGenres, { genre: 'other', count: otherCount }] : topGenres;

  return (
    <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-5 h-full border border-spotify-border/30 shadow-xl shadow-black/20">
      <h2 className="text-white font-bold text-base mb-4">Genre Distribution</h2>
      <div className="flex items-center gap-5">
        {/* 3D Donut chart */}
        <div className="relative flex-shrink-0 w-[170px] h-[170px]">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-spotify-green/5 blur-xl" />
          <div className="relative w-full h-full" style={{ filter: 'drop-shadow(0 4px 12px rgba(29, 185, 84, 0.15))' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {chartData.map((_, index) => (
                    <linearGradient key={`grad-${index}`} id={`genre-grad-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={2}
                  strokeWidth={0}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#genre-grad-${index})`}
                      style={{
                        filter: activeIndex === index ? 'brightness(1.3)' : 'brightness(1)',
                        transition: 'all 0.3s ease',
                        transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: 'center',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Inner shadow for depth */}
            <div
              className="absolute inset-[28%] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #0a0a0a 60%, transparent 100%)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
              }}
            />
          </div>

          {/* Tooltip overlay */}
          {activeIndex !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-white font-bold text-sm leading-tight">
                  {((chartData[activeIndex].count / total) * 100).toFixed(0)}%
                </p>
                <p className="text-spotify-text-muted text-[10px] truncate max-w-[60px]">
                  {chartData[activeIndex].genre}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {chartData.map((item, index) => {
            const pct = ((item.count / total) * 100).toFixed(0);
            const isActive = activeIndex === index;
            return (
              <div
                key={item.genre}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg transition-all duration-200 cursor-default ${
                  isActive ? 'bg-white/5 scale-[1.02]' : 'hover:bg-white/[0.03]'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                    boxShadow: isActive ? `0 0 6px ${COLORS[index % COLORS.length]}80` : 'none',
                  }}
                />
                <span className={`truncate flex-1 transition-colors ${isActive ? 'text-white' : 'text-spotify-text-secondary'}`}>
                  {item.genre}
                </span>
                <span className="text-white font-semibold tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MiniGenreChart({ genres }: { genres: GenreCount[] }) {
  if (genres.length === 0) return null;
  const total = genres.reduce((sum, g) => sum + g.count, 0);
  const topPct = ((genres[0].count / total) * 100).toFixed(0);

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={genres.slice(0, 5)}
            dataKey="count"
            cx="50%"
            cy="50%"
            innerRadius={16}
            outerRadius={27}
            paddingAngle={2}
            strokeWidth={0}
          >
            {genres.slice(0, 5).map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
        {topPct}%
      </span>
    </div>
  );
}
