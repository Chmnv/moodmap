import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  image?: string | null;
  variant?: 'green' | 'blue' | 'default';
  miniChart?: ReactNode;
}

const BG_MAP = {
  green: 'bg-card-green',
  blue: 'bg-card-blue',
  default: 'bg-spotify-card/60',
};

export default function StatCard({ label, value, sub, icon, image, variant = 'default', miniChart }: StatCardProps) {
  return (
    <div
      className={`${BG_MAP[variant]} backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden min-h-[120px] border border-spotify-border/30 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-shadow duration-300`}
    >
      <div className="flex-1 min-w-0 z-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-spotify-text-secondary mb-2">{label}</p>
        <p className="text-white font-extrabold text-xl leading-tight truncate">{value}</p>
        {sub && <p className="text-spotify-text-secondary text-sm mt-1 truncate">{sub}</p>}
        {icon && <div className="mt-2 text-spotify-text-muted">{icon}</div>}
      </div>
      {image && (
        <img
          src={image}
          alt=""
          className="w-[72px] h-[72px] rounded-xl object-cover flex-shrink-0 shadow-lg"
        />
      )}
      {miniChart && <div className="flex-shrink-0">{miniChart}</div>}
    </div>
  );
}
