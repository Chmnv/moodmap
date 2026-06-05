import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HourCount } from '../types/spotify';

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 6) return '6am';
  if (hour === 12) return '12pm';
  if (hour === 18) return '6pm';
  return '';
}

interface ListeningBarChartProps {
  data: HourCount[];
}

export default function ListeningBarChart({ data }: ListeningBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-spotify-dark rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-spotify-text-secondary">No listening activity data</p>
      </div>
    );
  }

  return (
    <div className="bg-spotify-dark rounded-xl p-5">
      <h2 className="text-white font-bold text-lg mb-1">Listening Activity by Hour</h2>
      <p className="text-spotify-text-secondary text-xs mb-4">Based on your last 50 plays</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
          <XAxis
            dataKey="hour"
            tickFormatter={formatHour}
            tick={{ fill: '#b3b3b3', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#b3b3b3', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: '#181818', border: '1px solid #333', borderRadius: '8px' }}
            labelFormatter={(label) => {
              const h = Number(label);
              const period = h < 12 ? 'AM' : 'PM';
              const displayHour = h % 12 === 0 ? 12 : h % 12;
              return `${displayHour}:00 ${period}`;
            }}
            formatter={(value) => [Number(value), 'plays']}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="count" fill="#1DB954" radius={[3, 3, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
