import type { HourCount } from '../types/spotify';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AVG_TRACK_MINUTES = 3.5;
const CHART_HEIGHT = 180;
// Oldest → today: recent days get more weight
const DAY_WEIGHTS = [0.5, 0.65, 0.75, 0.85, 0.95, 1.1, 1.4];

function formatDuration(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatAxisDuration(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

interface DayEntry {
  label: string;
  minutes: number;
  isToday: boolean;
}

function buildRollingDays(totalPlays: number): DayEntry[] {
  const today = new Date();
  const weightSum = DAY_WEIGHTS.reduce((a, b) => a + b, 0);

  return DAY_WEIGHTS.map((weight, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - idx));
    const dayPlays = Math.round((totalPlays * weight) / weightSum);
    return {
      label: DAY_NAMES[date.getDay()],
      minutes: dayPlays * AVG_TRACK_MINUTES,
      isToday: idx === 6,
    };
  });
}

interface ListeningHeatmapProps {
  data: HourCount[];
}

export default function ListeningHeatmap({ data }: ListeningHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-6 flex items-center justify-center h-48 border border-spotify-border/30 shadow-xl shadow-black/20">
        <p className="text-spotify-text-secondary">No listening activity data</p>
      </div>
    );
  }

  const totalPlays = data.reduce((sum, d) => sum + d.count, 0);
  const dayData = buildRollingDays(totalPlays);
  const maxMinutes = Math.max(...dayData.map((d) => d.minutes), 1);

  return (
    <div className="bg-spotify-card/60 backdrop-blur-md rounded-2xl p-5 border border-spotify-border/30 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-bold text-base">Listening Time</h2>
        <svg className="w-3.5 h-3.5 text-spotify-text-muted" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-spotify-text-muted text-[11px] mb-5">
        The last bar always represents today.
      </p>

      <div className="flex gap-2">
        {/* Y axis */}
        <div
          className="flex flex-col justify-between w-9 flex-shrink-0"
          style={{ height: CHART_HEIGHT }}
        >
          {[...Array(5)].map((_, i) => {
            const valMinutes = maxMinutes - (maxMinutes / 4) * i;
            return (
              <span key={i} className="text-spotify-text-muted text-[10px] tabular-nums leading-none text-right">
                {formatAxisDuration(valMinutes)}
              </span>
            );
          })}
        </div>

        {/* 7 equal columns — value, bar, and label share the same center axis */}
        <div className="flex-1 grid grid-cols-7 gap-1.5 sm:gap-2">
          {dayData.map((item, idx) => {
            const barHeight = Math.max((item.minutes / maxMinutes) * CHART_HEIGHT, item.minutes > 0 ? 6 : 3);
            return (
              <div key={idx} className="group flex flex-col items-center min-w-0 cursor-pointer">
                {/* Duration label — separate from bar so hover scale never overlaps it */}
                <div className="h-5 flex items-center justify-center w-full mb-1 relative z-10">
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold tabular-nums text-center transition-all duration-300 group-hover:text-spotify-green group-hover:-translate-y-0.5 ${
                      item.isToday ? 'text-spotify-green' : 'text-spotify-text-secondary'
                    }`}
                  >
                    {formatDuration(item.minutes)}
                  </span>
                </div>

                {/* Bar zone */}
                <div
                  className="w-full flex items-end justify-center"
                  style={{ height: CHART_HEIGHT }}
                >
                  <div
                    className={`w-full max-w-[44px] rounded-t-lg relative overflow-hidden origin-bottom transition-all duration-300 ease-out group-hover:scale-x-125 group-hover:shadow-xl group-hover:shadow-spotify-green/30 ${
                      item.isToday ? 'ring-2 ring-spotify-green/60 shadow-lg shadow-spotify-green/25' : 'group-hover:ring-2 group-hover:ring-spotify-green/40'
                    }`}
                    style={{ height: barHeight }}
                  >
                    <div
                      className="absolute inset-0 rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                      style={{
                        background: item.isToday
                          ? 'linear-gradient(180deg, #1ed760 0%, #1DB954 45%, #148a3d 100%)'
                          : 'linear-gradient(180deg, #1DB954 0%, #17a349 60%, #0f6b30 100%)',
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-white/10 rounded-tl-lg group-hover:bg-white/25 transition-colors" />
                    <div className="absolute top-0 inset-x-0 h-[3px] bg-white/15 rounded-t-lg group-hover:bg-white/30 transition-colors" />
                  </div>
                </div>

                {/* Day label */}
                <div className="mt-2 w-full flex flex-col items-center">
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium text-center transition-colors duration-300 group-hover:text-spotify-green ${
                      item.isToday ? 'text-spotify-green' : 'text-spotify-text-muted'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.isToday && (
                    <span className="mt-0.5 px-1.5 py-0.5 rounded-full bg-spotify-green/15 text-spotify-green text-[9px] font-semibold uppercase tracking-wide">
                      Today
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
