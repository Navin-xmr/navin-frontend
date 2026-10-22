import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import type { ShipmentStatus } from '@services/api/endpoints/shipments';
import { useShipmentStatusCounts } from './useShipmentStatusCounts';

const STAT_META: Record<ShipmentStatus, { labelKey: string; icon: React.ReactNode }> = {
  IN_TRANSIT: { labelKey: 'companyDashboard.stats.active', icon: <Truck size={18} /> },
  DELIVERED: { labelKey: 'companyDashboard.stats.delivered', icon: <CheckCircle2 size={18} /> },
  CREATED: { labelKey: 'companyDashboard.stats.pending', icon: <Clock size={18} /> },
  CANCELLED: { labelKey: 'companyDashboard.stats.cancelled', icon: <XCircle size={18} /> },
};

export interface ShipmentStatCardsProps {
  /** Change this value to reload the counts. */
  refreshKey?: number;
}

/** Shipment counts per status for the company dashboard. */
const ShipmentStatCards: React.FC<ShipmentStatCardsProps> = ({ refreshKey }) => {
  const { t } = useTranslation('dashboard');
  const { counts, isLoading, error, retry } = useShipmentStatusCounts(refreshKey);

  return (
    <div className="grid grid-cols-2 gap-6 max-md:gap-3" aria-busy={isLoading}>
      {isLoading &&
        [1, 2, 3, 4].map((i) => <div key={i} className="h-[120px] rounded-xl animate-shimmer" />)}

      {!isLoading && error && (
        <div
          role="alert"
          className="col-span-2 flex flex-col items-start gap-3 rounded-xl border border-[#1e293b] bg-[#14171e] p-6 text-sm text-[#94a3b8]"
        >
          <p className="m-0">{t('companyDashboard.stats.error')}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md border border-[#1e293b] bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white hover:border-[#62ffff]"
          >
            {t('companyDashboard.stats.retry')}
          </button>
        </div>
      )}

      {!isLoading &&
        !error &&
        counts.map(({ status, count, hasMore }) => (
          <div
            key={status}
            className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#334155] max-md:p-4"
          >
            <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em] mb-4">
              {STAT_META[status].icon}
              {t(STAT_META[status].labelKey)}
            </div>
            <div className="text-[32px] font-semibold text-white max-md:text-[28px]">
              {count}
              {hasMore ? '+' : ''}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ShipmentStatCards;
