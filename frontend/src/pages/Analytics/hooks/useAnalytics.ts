import { useEffect, useState } from 'react';
import {
  analyticsApi,
  type AnalyticsPerformance,
  type AnalyticsSummary,
} from '@services/api/endpoints/analytics';

export interface UseAnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export interface UseAnalyticsResult {
  performance: AnalyticsPerformance | null;
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAnalytics(params: UseAnalyticsParams = {}): UseAnalyticsResult {
  const [performance, setPerformance] = useState<AnalyticsPerformance | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        setIsLoading(true);
        setError(null);

        const [performanceData, summaryData] = await Promise.all([
          analyticsApi.getPerformance(params.startDate ?? '', params.endDate ?? ''),
          analyticsApi.getSummary(),
        ]);

        if (!isMounted) return;
        setPerformance(performanceData);
        setSummary(summaryData);
      } catch (caught) {
        if (!isMounted) return;
        setError(caught instanceof Error ? caught : new Error('Failed to load analytics data'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [params.startDate, params.endDate, refreshKey]);

  return {
    performance,
    summary,
    isLoading,
    error,
    refetch: () => setRefreshKey((key) => key + 1),
  };
}
