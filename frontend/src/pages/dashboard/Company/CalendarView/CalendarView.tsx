import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Shipment } from '../../../../api/shipmentApi';

interface CalendarShipment extends Shipment {
  expectedDelivery?: string;
}

interface BackendCalendarResponse {
  data?: Array<Record<string, unknown>>;
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-green-500',
  IN_TRANSIT: 'bg-blue-500',
  CREATED: 'bg-yellow-500',
  CANCELLED: 'bg-red-500',
};

function formatYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [shipments, setShipments] = useState<CalendarShipment[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchShipments = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const from = formatYMD(new Date(y, m, 1));
    const to = formatYMD(new Date(y, m + 1, 0));
    try {
      const res = await axios.get<BackendCalendarResponse>('/api/shipments', {
        params: { expectedDeliveryFrom: from, expectedDeliveryTo: to },
      });
      const items = (res.data?.data ?? []) as Array<Record<string, unknown>>;
      setShipments(
        items.map((s) => ({
          id: String(s.id),
          origin: String(s.origin ?? ''),
          destination: String(s.destination ?? ''),
          status: String(s.status ?? 'CREATED') as CalendarShipment['status'],
          createdAt: String(s.createdAt ?? ''),
          expectedDelivery: s.expectedDelivery ? String(s.expectedDelivery) : undefined,
        }))
      );
    } catch {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchShipments(year, month); }, 0);
    return () => clearTimeout(timer);
  }, [year, month, fetchShipments]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(formatYMD(today));
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const shipmentsByDay = shipments.reduce<Record<string, CalendarShipment[]>>((acc, s) => {
    if (!s.expectedDelivery) return acc;
    const key = s.expectedDelivery.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const todayStr = formatYMD(today);
  const selectedShipments = selectedDay ? (shipmentsByDay[selectedDay] ?? []) : [];

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Calendar panel */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold w-44 text-center">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={goToday}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
          >
            Today
          </button>
        </div>

        {loading && (
          <p className="text-sm text-gray-400 mb-2">Loading shipments…</p>
        )}

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="border-r border-b border-gray-200 h-20 bg-gray-50"
                />
              );
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayShipments = shipmentsByDay[dateStr] ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={[
                  'border-r border-b border-gray-200 h-20 p-1 text-left align-top',
                  'hover:bg-blue-50 transition-colors',
                  isSelected ? 'bg-blue-50' : 'bg-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full',
                    isToday ? 'bg-blue-600 text-white' : 'text-gray-700',
                  ].join(' ')}
                >
                  {day}
                </span>
                {dayShipments.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayShipments.slice(0, 3).map(s => (
                      <span
                        key={s.id}
                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-400'}`}
                      />
                    ))}
                    {dayShipments.length > 3 && (
                      <span className="text-[10px] text-gray-500">
                        +{dayShipments.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {status}
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      {selectedDay && (
        <div className="w-72 shrink-0 border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto">
          <h3 className="font-semibold text-sm mb-3">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </h3>
          {selectedShipments.length === 0 ? (
            <p className="text-sm text-gray-400">No shipments expected.</p>
          ) : (
            <ul className="space-y-2">
              {selectedShipments.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => navigate(`/dashboard/shipments/${s.id}`)}
                    className="w-full text-left rounded-md border border-gray-100 p-2 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-xs font-medium text-gray-800 truncate">
                      #{s.id}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {s.origin} → {s.destination}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded text-white ${STATUS_COLORS[s.status] ?? 'bg-gray-400'}`}
                    >
                      {s.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
