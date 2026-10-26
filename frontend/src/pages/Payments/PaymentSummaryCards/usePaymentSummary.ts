import { useCallback, useEffect, useState } from "react";
import {
  settlementsApi,
  RevenueSummaryResponse,
  SummaryPeriod,
} from "@services/api/endpoints/settlements";

export interface UsePaymentSummaryReturn {
  data: RevenueSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function usePaymentSummary(
  period: SummaryPeriod = "month",
): UsePaymentSummaryReturn {
  const [data, setData] = useState<RevenueSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    // A superseded request must never write its result.
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const summary = await settlementsApi.getSummary(period);
        if (!cancelled) setData(summary);
      } catch (e) {
        if (cancelled) return;
        setData(null);
        setError(
          e instanceof Error ? e.message : "Failed to load payment summary",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  return { data, isLoading, error, reload };
}
