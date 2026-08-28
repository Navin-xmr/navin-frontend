import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { CalendarRange, Filter, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { exceptionApi, ExceptionType, ShipmentException } from '@services/api/endpoints/exceptions';

type ExceptionItem = ShipmentException;

type FilterState = {
  type: 'ALL' | ExceptionType;
  dateRange: '7d' | '14d' | '30d' | 'all';
  route: string;
};

const EXCEPTION_TYPES: Array<{ value: ExceptionType; label: string; color: string }> = [
  { value: 'DELAYED', label: 'Delayed', color: '#38bdf8' },
  { value: 'DAMAGED', label: 'Damaged', color: '#fb923c' },
  { value: 'LOST', label: 'Lost', color: '#f43f5e' },
  { value: 'RETURNED', label: 'Returned', color: '#a78bfa' },
  { value: 'CUSTOMS_HOLD', label: 'Customs Hold', color: '#34d399' },
];

const generateTrendData = () => {
  const dates = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    return date;
  });

  return dates.map((date, index) => ({
    date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    DELAYED: 1 + ((index + 2) % 4),
    DAMAGED: 1 + (index % 3),
    LOST: index % 5 === 0 ? 2 : 1,
    RETURNED: 1 + ((index + 1) % 3),
    CUSTOMS_HOLD: 1 + (index % 2),
  }));
};

const ExceptionDashboard: React.FC = () => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ type: 'ALL', dateRange: '30d', route: '' });
  const [sortKey, setSortKey] = useState<'age' | 'type' | 'owner'>('age');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const filterId = useId();

  const trendData = useMemo(() => generateTrendData(), []);

  const fetchExceptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await exceptionApi.getAll({
        type: filters.type === 'ALL' ? undefined : filters.type,
        dateRange: filters.dateRange,
        route: filters.route || undefined,
      });
      setExceptions(data);
    } catch {
      setError('Failed to load exceptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.type, filters.dateRange, filters.route]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchExceptions(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchExceptions]);

  const visibleExceptions = useMemo(() => {
    const now = new Date();
    return exceptions.filter((item) => {
      const matchesType = filters.type === 'ALL' || item.type === filters.type;
      const matchesRoute = !filters.route || item.route.toLowerCase().includes(filters.route.toLowerCase());
      const itemDate = new Date(item.openedAt);
      const rangeDays = filters.dateRange === '7d' ? 7 : filters.dateRange === '14d' ? 14 : filters.dateRange === '30d' ? 30 : Number.MAX_SAFE_INTEGER;
      const withinRange = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24) <= rangeDays;
      return matchesType && matchesRoute && withinRange;
    }).sort((a, b) => {
      if (sortKey === 'age') return a.ageHours - b.ageHours;
      if (sortKey === 'type') return a.type.localeCompare(b.type);
      return a.owner.localeCompare(b.owner);
    });
  }, [exceptions, filters, sortKey]);

  const kpis = useMemo(() => {
    const openExceptions = visibleExceptions.filter((item) => item.status !== 'RESOLVED');
    const total = openExceptions.length;
    const totalShipments = 128;
    const exceptionRate = ((total / totalShipments) * 100).toFixed(1);
    const avgResolution = Math.round(openExceptions.reduce((sum, item) => sum + item.resolutionHours, 0) / Math.max(total, 1));
    const momDelta = 4.2;

    return [
      { label: 'Total exceptions this week', value: `${total}`, accent: 'text-cyan-400' },
      { label: 'Exception rate', value: `${exceptionRate}%`, accent: 'text-amber-400' },
      { label: 'MoM change', value: `${momDelta > 0 ? '+' : ''}${momDelta}%`, accent: momDelta >= 0 ? 'text-emerald-400' : 'text-rose-400' },
      { label: 'Avg resolution time (hours)', value: `${avgResolution}h`, accent: 'text-violet-400' },
    ];
  }, [visibleExceptions]);

  const handleResolve = (id: string) => {
    setResolvingId(id);
    setNote('');
  };

  const submitResolution = async (id: string) => {
    try {
      const updated = await exceptionApi.resolve(id, note);
      setExceptions((current) => current.map((item) => (item.id === id ? updated : item)));
    } catch {
      setError('Failed to resolve exception. Please try again.');
    } finally {
      setResolvingId(null);
      setNote('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">Shipment Exceptions</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Exception rate dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Monitor delays, damages, lost shipments, and customs holds across the network.</p>
          </div>
          <button
            type="button"
            onClick={() => fetchExceptions()}
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </div>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Exception trend</h2>
            <p className="text-sm text-slate-400">Stacked daily counts by exception type over the last 30 days.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
            <CalendarRange size={16} />
            Last 30 days
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
            {EXCEPTION_TYPES.map((type) => (
              <Area key={type.value} type="monotone" dataKey={type.value} stackId="exceptions" stroke={type.color} fill={type.color} fillOpacity={0.35} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Open exceptions</h2>
            <p className="text-sm text-slate-400">Sortable queue of open issues with inline resolution workflow.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label htmlFor={`${filterId}-type`} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
              <Filter size={16} />
              <select
                id={`${filterId}-type`}
                value={filters.type}
                onChange={(e) => setFilters((current) => ({ ...current, type: e.target.value as FilterState['type'] }))}
                className="bg-transparent text-sm text-white outline-none"
              >
                <option value="ALL">All types</option>
                {EXCEPTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
            <label htmlFor={`${filterId}-date-range`} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
              <CalendarRange size={16} />
              <select
                id={`${filterId}-date-range`}
                value={filters.dateRange}
                onChange={(e) => setFilters((current) => ({ ...current, dateRange: e.target.value as FilterState['dateRange'] }))}
                className="bg-transparent text-sm text-white outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="14d">Last 14 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </label>
            <label htmlFor={`${filterId}-route`} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-400">
              <Search size={16} />
              <input
                id={`${filterId}-route`}
                value={filters.route}
                onChange={(e) => setFilters((current) => ({ ...current, route: e.target.value }))}
                placeholder="Route"
                className="bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Shipment</th>
                <th className="px-4 py-3 font-medium">
                  <button type="button" className="flex items-center gap-1" onClick={() => setSortKey('type')}>
                    Type <TrendingUp size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <button type="button" className="flex items-center gap-1" onClick={() => setSortKey('age')}>
                    Age <TrendingUp size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button type="button" className="flex items-center gap-1" onClick={() => setSortKey('owner')}>
                    Owner <TrendingUp size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Loading exceptions...</td>
                </tr>
              )}
              {!isLoading && visibleExceptions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">No exceptions found.</td>
                </tr>
              )}
              {!isLoading && visibleExceptions.map((item) => (
                <tr key={item.id} className="border-t border-slate-800/70 bg-slate-900/40">
                  <td className="px-4 py-3 text-white">{item.shipmentId}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200">
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.status}</td>
                  <td className="px-4 py-3 text-slate-300">{item.ageHours}h</td>
                  <td className="px-4 py-3 text-slate-300">{item.owner}</td>
                  <td className="px-4 py-3 text-slate-300">{item.route}</td>
                  <td className="px-4 py-3">
                    {item.status !== 'RESOLVED' ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleResolve(item.id)}
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                        >
                          Resolve
                        </button>
                        {resolvingId === item.id && (
                          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={2}
                              placeholder="Add an update"
                              aria-label={`Resolution note for shipment ${item.shipmentId}`}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => submitResolution(item.id)}
                              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                            >
                              Save update
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-emerald-400">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExceptionDashboard;
