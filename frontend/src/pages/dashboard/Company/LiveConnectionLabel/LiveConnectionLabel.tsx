import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ConnectionStatus } from '@services/realtime/realtimeService';
import { useConnectionStatus } from '@hooks/useConnectionStatus';

const STATUS_LABEL_KEY: Record<ConnectionStatus, string> = {
  connected: 'companyDashboard.connected',
  reconnecting: 'companyDashboard.reconnecting',
  disconnected: 'companyDashboard.disconnected',
  offline: 'companyDashboard.offline',
};

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  connected: 'text-[#10b981]',
  reconnecting: 'text-[#f59e0b]',
  disconnected: 'text-[#ef4444]',
  offline: 'text-[#64748b]',
};

/** "Live: <state>", showing the real state of the realtime connection. */
const LiveConnectionLabel: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const status = useConnectionStatus();

  return (
    <span role="status">
      {t('companyDashboard.live')} <span className={STATUS_COLOR[status]}>{t(STATUS_LABEL_KEY[status])}</span>
    </span>
  );
};

export default LiveConnectionLabel;
