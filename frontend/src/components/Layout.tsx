import type { ReactNode } from 'react';
import type { TimeRange } from '../types/spotify';
import TopBar from './TopBar';

interface LayoutProps {
  children: ReactNode;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export default function Layout({ children, timeRange, onTimeRangeChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-spotify-black">
      <TopBar timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
      <main className="px-4 sm:px-6 lg:px-8 xl:px-12 py-6 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}
