import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, DollarSign, Truck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activityApi, type ActivityEvent } from '../../../api/activityApi';

export interface RecentActivityPanelProps {
  /** Maximum number of items to show initially. Defaults to 10. */
  limit?: number;
  /** Whether to show the "View All" link. Defaults to true. */
  showViewAll?: boolean;
  /** Custom CSS class for the root element. */
  className?: string;
}

const SKELETON_COUNT = 5;

type ActivityIconKey = 'Truck' | 'CheckCircle2' | 'AlertTriangle' | 'DollarSign';

const iconByKey: Record<ActivityIconKey, React.ReactNode> = {
  Truck: <Truck size={16} className="text-[#3b82f6]" />,
  CheckCircle2: <CheckCircle2 size={16} className="text-[#10b981]" />,
  AlertTriangle: <AlertTriangle size={16} className="text-[#f59e0b]" />,
  DollarSign: <DollarSign size={16} className="text-[#60a5fa]" />,
};

const getIconForEvent = (evt: ActivityEvent): React.ReactNode => {
  const type = String(evt.type ?? evt.event ?? '').toLowerCase();

  if (
    type.includes('deliver') ||
    type.includes('delivered') ||
    type.includes('verified') ||
    type.includes('success')
  ) {
    return iconByKey.CheckCircle2;
  }

  if (
    type.includes('alert') ||
    type.includes('delay') ||
    type.includes('warning') ||
    type.includes('problem') ||
    type.includes('anomaly')
  ) {
    return iconByKey.AlertTriangle;
  }

  if (
    type.includes('payment') ||
    type.includes('settlement') ||
    type.includes('dollar') ||
    type.includes('finance')
  ) {
    return iconByKey.DollarSign;
  }

  return iconByKey.Truck;
};

const formatRelativeTime = (isoTs: string): string => {
  const target = new Date(isoTs);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const rtf =
    typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat !== 'undefined'
      ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
      : null;

  const apply = (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
    if (rtf) return rtf.format(value, unit);
    const suffix = value < 0 ? 'ago' : 'from now';
    const abs = Math.abs(value);
    const unitStr =
      unit === 'minute' ? 'min' :
      unit === 'hour' ? 'hour' :
      unit === 'day' ? 'day' :
      unit === 'week' ? 'week' :
      unit === 'month' ? 'month' :
      unit === 'year' ? 'year' : 'sec';
    return `${abs} ${unitStr} ${suffix}`;
  };

  if (absSeconds < 60) return apply(diffSeconds, 'second');
  if (absSeconds < 3600) return apply(Math.round(diffSeconds / 60), 'minute');
  if (absSeconds < 86400) return apply(Math.round(diffSeconds / 3600), 'hour');
  if (absSeconds < 604800) return apply(Math.round(diffSeconds / 86400), 'day');
  if (absSeconds < 2592000) return apply(Math.round(diffSeconds / 604800), 'week');
  if (absSeconds < 31536000) return apply(Math.round(diffSeconds / 2592000), 'month');
  return apply(Math.round(diffSeconds / 31536000), 'year');
};

const startOfLocalDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getDateGroup = (isoTs: string): 'today' | 'yesterday' | 'earlier' => {
  const ts = new Date(isoTs);
  const t = startOfLocalDay(ts).getTime();
  const today = startOfLocalDay(new Date()).getTime();
  const yesterday = today - 86400000;
  if (t === today) return 'today';
  if (t === yesterday) return 'yesterday';
  return 'earlier';
};

const groupLabel: Record<'today' | 'yesterday' | 'earlier', string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
};

const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  limit = 10,
  showViewAll = true,
  className = '',
}) => {
  const [items, setItems] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const refreshIntervalRef = useRef<number | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await activityApi.getActivity({ limit });
      setItems(res.data ?? []);
      setError(false);
    } catch {
      setError(true);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchActivity(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchActivity]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = window.setInterval(() => {
      void fetchActivity();
    }, 60_000);
    return () => {
      if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
    };
  }, [fetchActivity]);

  const grouped = useMemo(() => {
    const buckets: Record<'today' | 'yesterday' | 'earlier', ActivityEvent[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };
    for (const evt of items) {
      buckets[getDateGroup(evt.createdAt)].push(evt);
    }
    (Object.keys(buckets) as Array<keyof typeof buckets>).forEach((k) => {
      buckets[k] = [...buckets[k]].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    return buckets;
  }, [items]);

  const hasAny = items.length > 0;

  return (
    <div
      className={`bg-[#14171e] border border-[rgba(30,41,59,0.5)] rounded-xl overflow-hidden ${className}`}
      aria-label="Recent activity panel"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[rgba(30,41,59,0.5)]">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#62ffff]" />
            <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0 max-md:text-lg max-md:font-bold max-md:text-white max-md:normal-case max-md:tracking-normal">
              Recent Activity
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94a3b8] font-medium">Live updates</span>
            {showViewAll && (
              <Link
                to="/dashboard/notifications"
                className="text-xs font-semibold text-[#3b82f6] no-underline hover:text-white transition-colors"
              >
                View all
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="px-6 py-4" aria-label="Loading recent activity">
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-md bg-[rgba(148,163,184,0.12)] animate-shimmer shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 bg-[rgba(148,163,184,0.12)] rounded-full animate-shimmer w-[70%]" />
                <div className="h-3 bg-[rgba(148,163,184,0.12)] rounded-full animate-shimmer w-[45%] mt-2" />
              </div>
              <div className="w-[90px] h-3 bg-[rgba(148,163,184,0.12)] rounded-full animate-shimmer shrink-0" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-10 flex flex-col items-center text-center gap-2">
          <AlertTriangle size={44} className="text-[#ef4444]" />
          <div className="text-sm font-semibold text-white">Failed to load activity</div>
          <div className="text-xs text-[#94a3b8]">Please try again shortly.</div>
          <button
            type="button"
            className="mt-2 bg-[#3b82f6] text-white border-none rounded-lg px-3.5 py-2 text-[13px] font-semibold cursor-pointer hover:bg-[#2563eb] transition-colors"
            onClick={() => { setIsLoading(true); void fetchActivity(); }}
          >
            Retry
          </button>
        </div>
      ) : !hasAny ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <Activity size={32} className="text-[#334155]" />
          <h3 className="text-base font-semibold text-white m-0">No recent activity</h3>
          <p className="text-[#94a3b8] text-sm max-w-[360px] m-0">
            When shipments update, you'll see events here.
          </p>
        </div>
      ) : (
        <div className="px-6 py-2">
          {(['today', 'yesterday', 'earlier'] as const).map((bucketKey) => {
            const bucketItems = grouped[bucketKey];
            if (!bucketItems.length) return null;

            return (
              <div key={bucketKey} className="mb-2">
                <div className="px-1 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748b]">
                  {groupLabel[bucketKey]}
                </div>
                <div className="flex flex-col gap-1">
                  {bucketItems.map((evt) => {
                    const icon = getIconForEvent(evt);
                    const shipmentId = evt.shipmentId ?? evt.shipment?.id;
                    const title =
                      evt.description ??
                      evt.message ??
                      evt.event ??
                      (evt.type ? `Event: ${evt.type}` : 'Shipment update');

                    return (
                      <div
                        key={evt.id}
                        className="flex items-start justify-between gap-4 py-2.5 rounded-lg px-1 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5 w-8 h-8 rounded-md bg-[rgba(148,163,184,0.12)] flex items-center justify-center shrink-0">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {title}
                            </div>
                            <div className="text-xs text-[#94a3b8] mt-1 truncate">
                              {shipmentId ? (
                                <Link
                                  to={`/shipments/${encodeURIComponent(String(shipmentId))}`}
                                  className="text-[#3b82f6] font-semibold no-underline hover:underline"
                                >
                                  Shipment #{String(shipmentId)}
                                </Link>
                              ) : (
                                <span className="text-[#94a3b8]">Shipment details unavailable</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[#94a3b8] font-medium shrink-0">
                          {formatRelativeTime(evt.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="py-3 text-center border-t border-[rgba(30,41,59,0.5)] mt-2">
            <Link
              to="/dashboard/notifications"
              className="text-xs font-semibold text-[#94a3b8] no-underline hover:text-white transition-colors"
            >
              View full activity log →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivityPanel;
