import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, ExternalLink, CheckCircle2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { anomalyApi, Anomaly, AnomalySeverity } from '@services/api/endpoints/anomalies';
import { safeFormatDate } from '@utils/safeFormat';
import { Link } from 'react-router-dom';

const SEVERITY_ORDER: Record<AnomalySeverity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const SEVERITY_CLASSES: Record<AnomalySeverity, string> = {
  HIGH:   'bg-[rgba(239,68,68,0.1)]   text-[#ef4444]  border border-[rgba(239,68,68,0.2)]',
  MEDIUM: 'bg-[rgba(245,158,11,0.1)]  text-[#f59e0b]  border border-[rgba(245,158,11,0.2)]',
  LOW:    'bg-[rgba(59,130,246,0.1)]  text-[#3b82f6]  border border-[rgba(59,130,246,0.2)]',
};

const ANOMALY_TYPE_LABEL_KEYS: Record<string, string> = {
  TEMPERATURE_EXCEEDED:  'anomalyPanel.types.temperatureExceeded',
  TEMPERATURE_BELOW_MIN: 'anomalyPanel.types.temperatureBelowMin',
  HUMIDITY_EXCEEDED:     'anomalyPanel.types.humidityExceeded',
  HUMIDITY_BELOW_MIN:    'anomalyPanel.types.humidityBelowMin',
  BATTERY_LOW:           'anomalyPanel.types.batteryLow',
};

export interface AnomalyAlertPanelProps {}

const AnomalyAlertPanel: React.FC<AnomalyAlertPanelProps> = () => {
  const { t } = useTranslation('dashboard');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const fetchAnomalies = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const result = await anomalyApi.getAll({ status: "OPEN" });
      const open = result.data.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
      setAnomalies(open);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchAnomalies();
    });
  }, [fetchAnomalies]);

  const handleAcknowledge = async (id: string) => {
    try {
      setAcknowledging(id);
      await anomalyApi.acknowledge(id);
      setAnomalies((prev) => prev.filter((a) => a._id !== id));
    } catch {
      // keep the item in the list; surface no crash
    } finally {
      setAcknowledging(null);
    }
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6 flex flex-col gap-6 max-md:px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
            {t('anomalyPanel.title')}
          </h1>
          <p className="text-[#94a3b8] text-sm">
            {t('anomalyPanel.subtitle')}
          </p>
        </div>
        <button
          onClick={fetchAnomalies}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
          aria-label={t('anomalyPanel.refreshAriaLabel')}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {t('anomalyPanel.refresh')}
        </button>
      </div>

      {/* Count badge */}
      {!loading && !error && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#94a3b8]">
            {anomalies.length === 0
              ? t('anomalyPanel.noOpenAnomalies')
              : t('anomalyPanel.openAnomalies', { count: anomalies.length })}
          </span>
          {anomalies.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ef4444] text-white text-[11px] font-bold">
              {anomalies.length}
            </span>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-3" aria-label={t('anomalyPanel.loadingAriaLabel')}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[#14171e] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#ef4444] rounded-xl text-center">
          <AlertTriangle size={40} className="text-[#ef4444] mb-3" />
          <p className="text-[#94a3b8] text-sm mb-4">{t('anomalyPanel.errorBody')}</p>
          <button
            onClick={fetchAnomalies}
            className="bg-[#ef4444] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#dc2626] transition-colors"
          >
            {t('anomalyPanel.retry')}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && anomalies.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#1e293b] rounded-xl text-center">
          <CheckCircle2 size={40} className="text-[#10b981] mb-3" />
          <p className="text-white font-semibold mb-1">{t('anomalyPanel.allClear')}</p>
          <p className="text-[#94a3b8] text-sm">{t('anomalyPanel.allClearBody')}</p>
        </div>
      )}

      {/* Anomaly list */}
      {!loading && !error && anomalies.length > 0 && (
        <div className="flex flex-col gap-3" role="list" aria-label={t('anomalyPanel.listAriaLabel')}>
          {anomalies.map((anomaly) => (
            <div
              key={anomaly._id}
              role="listitem"
              className="bg-[#14171e] border border-[#1e293b] rounded-xl p-5 flex items-start gap-4 hover:border-[#334155] transition-colors max-md:flex-col"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.08)] flex items-center justify-center mt-0.5">
                <AlertTriangle size={18} className="text-[#ef4444]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_CLASSES[anomaly.severity]}`}
                    aria-label={t('anomalyPanel.severityAriaLabel', { severity: anomaly.severity })}
                  >
                    {anomaly.severity}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {ANOMALY_TYPE_LABEL_KEYS[anomaly.type] ? t(ANOMALY_TYPE_LABEL_KEYS[anomaly.type]) : anomaly.type}
                  </span>
                </div>

                <p className="text-[#94a3b8] text-sm leading-relaxed mb-2 line-clamp-2">
                  {anomaly.message}
                </p>

                <div className="flex items-center gap-4 text-xs text-[#64748b]">
                  <span>{t('anomalyPanel.detected', { date: safeFormatDate(anomaly.timestamp) })}</span>
                  <span className="truncate max-w-[200px]">
                    {t('anomalyPanel.shipmentPrefix')}{' '}
                    <span className="text-[#94a3b8] font-mono">{anomaly.shipmentId}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 max-md:w-full max-md:justify-end">
                <Link
                  to={`/dashboard/shipments/${anomaly.shipmentId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e293b] text-[#94a3b8] text-xs font-medium hover:border-[#334155] hover:text-white transition-colors"
                  aria-label={t('anomalyPanel.viewShipmentAriaLabel', { id: anomaly.shipmentId })}
                >
                  <ExternalLink size={13} />
                  {t('anomalyPanel.viewShipment')}
                </Link>
                <button
                  onClick={() => handleAcknowledge(anomaly._id)}
                  disabled={acknowledging === anomaly._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-xs font-medium hover:bg-[rgba(16,185,129,0.2)] transition-colors disabled:opacity-50"
                  aria-label={t('anomalyPanel.acknowledgeAriaLabel', { id: anomaly._id })}
                >
                  <CheckCircle2 size={13} />
                  {acknowledging === anomaly._id ? t('anomalyPanel.acknowledging') : t('anomalyPanel.acknowledge')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnomalyAlertPanel;
