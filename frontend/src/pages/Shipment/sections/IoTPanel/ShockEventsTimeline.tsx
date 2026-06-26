import React from 'react';
import type { TelemetryRecord } from './hooks/useTelemetry';

interface Props {
  records: TelemetryRecord[];
}

function severity(g: number): { label: string; color: string } {
  if (g > 5) return { label: 'HIGH', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (g >= 2) return { label: 'MEDIUM', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'LOW', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' };
}

const ShockEventsTimeline: React.FC<Props> = ({ records }) => {
  const events = records
    .filter((r) => r.shockMagnitude > 0)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-6">
        No shock events recorded
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {events.map((event, i) => {
        const { label, color } = severity(event.shockMagnitude);
        const time = new Date(event.timestamp).toLocaleString();
        return (
          <li key={`${event.timestamp}-${i}`} className="flex gap-4 relative pb-6 last:pb-0">
            {/* Vertical line */}
            {i < events.length - 1 && (
              <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" aria-hidden="true" />
            )}
            {/* Dot */}
            <span className="w-6 h-6 rounded-full border-2 border-border bg-background-card shrink-0 mt-0.5 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-text-primary">
                  {event.shockMagnitude.toFixed(1)}G
                </span>
                <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${color}`}>
                  {label}
                </span>
              </div>
              <span className="text-xs text-text-secondary">{time}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ShockEventsTimeline;
