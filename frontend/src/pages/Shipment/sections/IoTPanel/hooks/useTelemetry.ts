import { useState, useEffect, useCallback, useRef } from 'react';

export interface TelemetryRecord {
  timestamp: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  shockMagnitude: number;
  batteryLevel: number;
  isAnomaly: boolean;
  anomalyType?: 'TEMPERATURE_BREACH' | 'SHOCK_EVENT' | 'HUMIDITY_BREACH' | 'GPS_LOST';
}

export type TimeRange = '6h' | '24h' | '7d';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const POLL_INTERVAL_MS = 60_000;

function rangeToMs(range: TimeRange): number {
  switch (range) {
    case '6h': return 6 * 60 * 60 * 1000;
    case '24h': return 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function useTelemetry(shipmentId: string) {
  const [latestReading, setLatestReading] = useState<TelemetryRecord | null>(null);
  const [history, setHistory] = useState<TelemetryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const mountedRef = useRef(true);

  const fetchLatest = useCallback(async () => {
    try {
      const data = await fetchJson<TelemetryRecord>(
        `${API_BASE}/api/shipments/${shipmentId}/telemetry/latest`,
      );
      if (mountedRef.current) setLatestReading(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch telemetry');
      }
    }
  }, [shipmentId]);

  const fetchHistory = useCallback(async () => {
    const now = Date.now();
    const from = new Date(now - rangeToMs(timeRange)).toISOString();
    const to = new Date(now).toISOString();
    try {
      const data = await fetchJson<TelemetryRecord[]>(
        `${API_BASE}/api/shipments/${shipmentId}/telemetry?from=${from}&to=${to}&limit=200`,
      );
      if (mountedRef.current) setHistory(data);
    } catch {
      // history fetch failure is non-fatal
    }
  }, [shipmentId, timeRange]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchLatest(), fetchHistory()]);
      if (mountedRef.current) setIsLoading(false);
    };
    load().catch(() => { if (mountedRef.current) setIsLoading(false); });
    return () => { mountedRef.current = false; };
  }, [fetchLatest, fetchHistory]);

  // Poll latest every 60s
  useEffect(() => {
    const id = setInterval(fetchLatest, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchLatest]);

  const hasAnomalies = latestReading?.isAnomaly ?? false;

  return { latestReading, history, isLoading, error, hasAnomalies, timeRange, setTimeRange };
}
