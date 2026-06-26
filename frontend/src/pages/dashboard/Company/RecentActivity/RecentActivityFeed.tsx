import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AlertTriangle, CheckCircle2, DollarSign, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activityApi, type ActivityEvent } from '@src/api/activityApi';

const PAGE_LIMIT = 20;
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

    if (type.includes('deliver') || type.includes('delivered') || type.includes('verified') || type.includes('success')) {
        return iconByKey.CheckCircle2;
    }

    if (type.includes('alert') || type.includes('delay') || type.includes('warning') || type.includes('problem') || type.includes('anomaly')) {
        return iconByKey.AlertTriangle;
    }

    if (type.includes('payment') || type.includes('settlement') || type.includes('dollar') || type.includes('finance')) {
        return iconByKey.DollarSign;
    }

    // Default: truck movement
    return iconByKey.Truck;
};

const formatRelativeTime = (isoTs: string): string => {
    const target = new Date(isoTs);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffSeconds = Math.round(diffMs / 1000);

    const absSeconds = Math.abs(diffSeconds);

    const rtf =
        typeof Intl !== 'undefined' && (Intl as any).RelativeTimeFormat
            ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
            : null;

    const apply = (value: number, unit: Intl.RelativeTimeFormatUnit) => {
        if (rtf) return rtf.format(value, unit);

        // fallback (past/future)
        const suffix = value < 0 ? 'ago' : 'from now';
        const abs = Math.abs(value);
        const label =
            unit === 'minute'
                ? 'min'
                : unit === 'hour'
                    ? 'hour'
                    : unit === 'day'
                        ? 'day'
                        : unit === 'week'
                            ? 'week'
                            : unit === 'month'
                                ? 'month'
                                : unit === 'year'
                                    ? 'year'
                                    : 'sec';

        return `${abs} ${label} ${suffix}`;
    };

    if (absSeconds < 60) return apply(diffSeconds, 'second');
    if (absSeconds < 60 * 60) return apply(Math.round(diffSeconds / 60), 'minute');
    if (absSeconds < 60 * 60 * 24) return apply(Math.round(diffSeconds / (60 * 60)), 'hour');
    if (absSeconds < 60 * 60 * 24 * 7) return apply(Math.round(diffSeconds / (60 * 60 * 24)), 'day');
    if (absSeconds < 60 * 60 * 24 * 30) return apply(Math.round(diffSeconds / (60 * 60 * 24 * 7)), 'week');
    if (absSeconds < 60 * 60 * 24 * 365) return apply(Math.round(diffSeconds / (60 * 60 * 24 * 30)), 'month');
    return apply(Math.round(diffSeconds / (60 * 60 * 24 * 365)), 'year');
};

const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getDateGroup = (isoTs: string): 'today' | 'yesterday' | 'earlier' => {
    const ts = new Date(isoTs);
    const t = startOfLocalDay(ts).getTime();
    const now = new Date();
    const today = startOfLocalDay(now).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;

    if (t === today) return 'today';
    if (t === yesterday) return 'yesterday';
    return 'earlier';
};

const groupLabel: Record<'today' | 'yesterday' | 'earlier', string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
};

const RecentActivityFeed: React.FC = () => {
    const [items, setItems] = useState<ActivityEvent[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);

    const beforeCursorRef = useRef<string | undefined>(undefined);
    const refreshIntervalRef = useRef<number | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const fetchPage = async (opts: { reset?: boolean } = {}) => {
        const limit = PAGE_LIMIT;
        const before = opts.reset ? undefined : beforeCursorRef.current;

        if (opts.reset) {
            setIsInitialLoading(true);
            setError(false);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const res = await activityApi.getActivity({ limit, before });
            const data = res.data ?? [];

            if (opts.reset) {
                setItems(data);
            } else {
                setItems((prev) => [...prev, ...data]);
            }

            // Best-effort cursor support: use the last item's createdAt.
            const last = data[data.length - 1];
            beforeCursorRef.current = last?.createdAt;

            // If fewer than limit were returned, assume no more.
            setHasMore(data.length === limit);

            setError(false);
        } catch {
            setError(true);
            if (opts.reset) setItems([]);
            setHasMore(false);
        } finally {
            if (opts.reset) setIsInitialLoading(false);
            else setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        void fetchPage({ reset: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-refresh every 60 seconds.
    useEffect(() => {
        if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);

        refreshIntervalRef.current = window.setInterval(() => {
            void fetchPage({ reset: true });
        }, 60_000);

        return () => {
            if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load-more on scroll (best-effort).
    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (!first?.isIntersecting) return;
                if (!hasMore || isLoadingMore || isInitialLoading) return;
                void fetchPage({ reset: false });
            },
            { root: null, rootMargin: '200px', threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, isLoadingMore, isInitialLoading]);

    const grouped = useMemo(() => {
        const buckets: Record<'today' | 'yesterday' | 'earlier', ActivityEvent[]> = {
            today: [],
            yesterday: [],
            earlier: [],
        };

        for (const evt of items) {
            const group = getDateGroup(evt.createdAt);
            buckets[group].push(evt);
        }

        // Sort each bucket by createdAt desc.
        (Object.keys(buckets) as Array<keyof typeof buckets>).forEach((k) => {
            buckets[k] = [...buckets[k]].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        return buckets;
    }, [items]);

    const hasAny = items.length > 0;

    return (
        <div className="bg-[#14171e] border border-[rgba(30,41,59,0.5)] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(30,41,59,0.5)]">
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0 max-md:text-lg max-md:font-bold max-md:text-white max-md:normal-case max-md:tracking-normal">
                        Recent Activity
                    </h2>
                    <div className="text-xs text-[#94a3b8] font-medium">Live updates</div>
                </div>
            </div>

            {isInitialLoading ? (
                <div className="px-6 py-4" aria-label="Recent activity loading">
                    {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-3">
                            <div className="w-8 h-8 rounded-md bg-[rgba(148,163,184,0.12)] animate-shimmer" />
                            <div className="flex-1">
                                <div className="h-3.5 bg-[rgba(148,163,184,0.12)] rounded-full animate-shimmer w-[70%]" />
                                <div className="h-3 bg-[rgba(148,163,184,0.12)] rounded-full animate-shimmer w-[45%] mt-2" />
                            </div>
                            <div className="w-[90px] h-3 bg-[rgba(148,163,184,0.12)] rounded-full animate-shimmer" />
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
                        className="mt-2 bg-accent-blue text-white border-none rounded-lg px-3.5 py-2 text-[13px] font-semibold cursor-pointer"
                        onClick={() => void fetchPage({ reset: true })}
                    >
                        Retry
                    </button>
                </div>
            ) : !hasAny ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                    <h3 className="text-lg font-semibold">No recent activity</h3>
                    <p className="text-text-secondary text-sm max-w-[420px]">When shipments update, you’ll see events here.</p>
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
                                            <div key={evt.id} className="flex items-start justify-between gap-4 py-2.5">
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

                    {/* Load more */}
                    <div ref={loadMoreRef} />

                    <div className="flex justify-center py-3">
                        {hasMore ? (
                            <button
                                type="button"
                                onClick={() => void fetchPage({ reset: false })}
                                disabled={isLoadingMore}
                                className="border border-border bg-background-elevated text-[#d1d5db] rounded-lg cursor-pointer text-xs font-semibold inline-flex items-center gap-1.5 px-3 py-2 disabled:opacity-45 disabled:cursor-not-allowed transition-colors hover:not-disabled:bg-[#1a2030]"
                            >
                                {isLoadingMore ? 'Loading…' : 'Load more'}
                            </button>
                        ) : (
                            <div className="text-xs text-[#94a3b8] font-medium py-2">You’re all caught up</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivityFeed;

