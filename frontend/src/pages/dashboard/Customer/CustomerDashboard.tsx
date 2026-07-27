import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, CheckCircle2, Bell,
  ArrowUpDown, AlertTriangle, Download,
  DollarSign,
} from 'lucide-react';
import { shipmentApi, Shipment, ShipmentStatus } from '../../../services/api/endpoints/shipments';
import { getStatusBadgeClass, getStatusDisplayLabel } from '../../../utils/shipmentStatus';
import { safeFormatDate, safeDateCompare } from '../../../utils/safeFormat';
import { NotificationItem } from '../../../components/notifications/NotificationDropdown/NotificationDropdown';

// No notifications API yet — use same mock as NotificationDropdown
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', type: 'shipment', message: 'Shipment #SH-2024-001 has been delivered successfully', timestamp: new Date(Date.now() - 2 * 3600000), read: false },
  { id: '2', type: 'payment', message: 'Payment of 5,000 XLM received for shipment #SH-2024-002', timestamp: new Date(Date.now() - 5 * 3600000), read: false },
  { id: '3', type: 'alert', message: 'Shipment #SH-2024-003 is delayed due to weather conditions', timestamp: new Date(Date.now() - 86400000), read: false },
  { id: '4', type: 'shipment', message: 'New shipment #SH-2024-004 is awaiting pickup', timestamp: new Date(Date.now() - 2 * 86400000), read: true },
];

const STATUS_PROGRESS: Record<ShipmentStatus, number> = {
  CREATED: 25,
  IN_TRANSIT: 60,
  DELIVERED: 100,
  CANCELLED: 0,
};

const PROGRESS_BAR_COLOR: Record<ShipmentStatus, string> = {
  CREATED: 'bg-[#f59e0b]',
  IN_TRANSIT: 'bg-[#3b82f6]',
  DELIVERED: 'bg-[#10b981]',
  CANCELLED: 'bg-[#ef4444]',
};

function getMilestoneProgress(shipment: Shipment): number {
  if (shipment.milestones.length > 0) {
    const maxMilestones = 4;
    return Math.min(100, Math.round((shipment.milestones.length / maxMilestones) * 100));
  }
  return STATUS_PROGRESS[shipment.status] ?? 0;
}

function getTimeAgo(timestamp: Date): string {
  const diffMs = Date.now() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getNotificationIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'shipment': return <Package size={14} className="text-blue-400" />;
    case 'payment':  return <DollarSign size={14} className="text-emerald-400" />;
    case 'alert':    return <AlertTriangle size={14} className="text-amber-400" />;
    default:         return <Bell size={14} className="text-slate-400" />;
  }
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [pastSortOrder, setPastSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    shipmentApi
      .getAll({ limit: 100, role: 'customer' })
      .then(res => setShipments(res.data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const activeShipments = useMemo(
    () => shipments.filter(s => s.status === 'CREATED' || s.status === 'IN_TRANSIT'),
    [shipments],
  );

  const pastShipments = useMemo(() => {
    const past = shipments.filter(s => s.status === 'DELIVERED' || s.status === 'CANCELLED');
    return [...past].sort((a, b) => {
      const diff = safeDateCompare(a.updatedAt, b.updatedAt);
      return pastSortOrder === 'desc' ? -diff : diff;
    });
  }, [shipments, pastSortOrder]);

  const inTransitCount = useMemo(
    () => shipments.filter(s => s.status === 'IN_TRANSIT').length,
    [shipments],
  );

  const deliveredThisMonth = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return shipments.filter(s => s.status === 'DELIVERED' && new Date(s.updatedAt) >= startOfMonth).length;
  }, [shipments]);

  const unreadNotifications = MOCK_NOTIFICATIONS.filter(n => !n.read).slice(0, 3);

  if (hasError) {
    return (
      <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#ef4444] rounded-xl text-center">
          <AlertTriangle size={48} className="text-[#ef4444] mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-[#94a3b8] text-sm mb-4">There was a problem loading your shipments.</p>
          <button
            className="bg-[#ef4444] text-white border-none px-4 py-2 rounded-md font-medium cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-white bg-transparent w-full max-w-[1080px] mx-auto min-h-[calc(100vh-72px)] px-[46px] py-6 flex flex-col gap-8 max-md:px-4 max-md:gap-6 max-md:pb-[90px]">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1">My Shipments</h1>
        <p className="text-[#94a3b8] text-sm m-0">Track your active and past deliveries</p>
      </div>

      {/* Main grid: content left, notifications right */}
      <div className="grid grid-cols-[1fr_280px] gap-6 items-start max-md:grid-cols-1">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-8">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {isLoading
              ? [1, 2, 3].map(i => <div key={i} className="h-[100px] rounded-xl animate-shimmer" />)
              : (
                <>
                  <div className="bg-[#14171e] border border-[#1e293b] rounded-xl p-5 flex flex-col gap-2 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em]">
                      <Package size={15} /> Total Shipments
                    </div>
                    <div className="text-[28px] font-semibold">{shipments.length}</div>
                  </div>
                  <div className="bg-[#14171e] border border-[#1e293b] rounded-xl p-5 flex flex-col gap-2 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em]">
                      <Truck size={15} /> In Transit
                    </div>
                    <div className="text-[28px] font-semibold text-[#3b82f6]">{inTransitCount}</div>
                  </div>
                  <div className="bg-[#14171e] border border-[#1e293b] rounded-xl p-5 flex flex-col gap-2 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em]">
                      <CheckCircle2 size={15} /> Delivered This Month
                    </div>
                    <div className="text-[28px] font-semibold text-[#10b981]">{deliveredThisMonth}</div>
                  </div>
                </>
              )}
          </div>

          {/* Active Shipments */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0">
                Active Shipments
              </h2>
              {!isLoading && (
                <span className="text-xs text-[#94a3b8]">
                  {activeShipments.length} shipment{activeShipments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {[1, 2].map(i => <div key={i} className="h-[190px] rounded-xl animate-shimmer" />)}
              </div>
            ) : activeShipments.length === 0 ? (
              <div className="bg-[#14171e] border border-dashed border-[#1e293b] rounded-xl p-10 text-center">
                <Package size={32} className="text-[#334155] mx-auto mb-3" />
                <p className="text-[#94a3b8] text-sm">No active shipments</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {activeShipments.map(shipment => {
                  const progress = getMilestoneProgress(shipment);
                  const barColor = PROGRESS_BAR_COLOR[shipment.status] ?? 'bg-[#62ffff]';
                  const eta = (shipment.offChainMetadata?.estimatedDelivery as string | undefined) ?? shipment.updatedAt;
                  return (
                    <div
                      key={shipment._id}
                      data-testid="active-shipment-card"
                      role="button"
                      tabIndex={0}
                      className="bg-[#14171e] border border-[#1e293b] rounded-xl p-5 flex flex-col gap-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[#334155] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-[#62ffff] focus-visible:outline-offset-2"
                      onClick={() => navigate(`/dashboard/shipments/${shipment._id}`)}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/dashboard/shipments/${shipment._id}`)}
                    >
                      {/* Header row */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm font-semibold font-mono text-[#62ffff] truncate">
                          {shipment.trackingNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${getStatusBadgeClass(shipment.status)}`}>
                          {getStatusDisplayLabel(shipment.status)}
                        </span>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                        <span className="truncate">{shipment.origin}</span>
                        <span className="text-[#334155] shrink-0">→</span>
                        <span className="truncate">{shipment.destination}</span>
                      </div>

                      {/* ETA */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-[#64748b] uppercase tracking-[0.05em]">Est. Delivery</span>
                        <span className="text-sm font-medium">{safeFormatDate(eta)}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-[#64748b]">Milestone Progress</span>
                          <span className="text-[11px] font-semibold text-[#94a3b8]">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Past Shipments */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0">
                Past Shipments
              </h2>
            </div>

            {isLoading ? (
              <div className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-8 rounded animate-shimmer-teal" />)}
              </div>
            ) : pastShipments.length === 0 ? (
              <div className="bg-[rgba(19,186,186,0.05)] border border-dashed border-[rgba(98,255,255,0.15)] rounded-xl p-10 text-center">
                <Package size={32} className="text-[rgba(98,255,255,0.2)] mx-auto mb-3" />
                <p className="text-[#94a3b8] text-sm">No past shipments yet</p>
              </div>
            ) : (
              <div className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-2xl overflow-hidden shadow-[inset_0_0_20px_0px_rgba(0,128,128,0.3)] overflow-x-auto">
                <table className="w-full border-collapse min-w-[560px]">
                  <thead className="bg-[rgba(19,186,186,0.1)]">
                    <tr>
                      <th className="text-left px-5 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]">
                        Tracking #
                      </th>
                      <th className="text-left px-5 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]">
                        Route
                      </th>
                      <th className="text-left px-5 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]">
                        Status
                      </th>
                      <th
                        className="text-left px-5 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)] cursor-pointer select-none hover:text-white transition-colors"
                        onClick={() => setPastSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          Delivery Date <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th className="text-left px-5 py-4 text-[11px] font-semibold text-[#62ffff] uppercase border-b border-[rgba(98,255,255,0.2)]">
                        Proof
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastShipments.map(shipment => {
                      const proofUrl = shipment.offChainMetadata?.proofUrl as string | undefined;
                      return (
                        <tr
                          key={shipment._id}
                          className="hover:bg-[rgba(98,255,255,0.05)] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-sm border-b border-[rgba(98,255,255,0.1)] font-semibold font-mono text-[#62ffff]">
                            {shipment.trackingNumber}
                          </td>
                          <td className="px-5 py-3.5 text-sm border-b border-[rgba(98,255,255,0.1)] text-[#94a3b8]">
                            {shipment.origin} → {shipment.destination}
                          </td>
                          <td className="px-5 py-3.5 text-sm border-b border-[rgba(98,255,255,0.1)]">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadgeClass(shipment.status)}`}>
                              {getStatusDisplayLabel(shipment.status)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm border-b border-[rgba(98,255,255,0.1)] text-[#94a3b8]">
                            {safeFormatDate(shipment.updatedAt)}
                          </td>
                          <td className="px-5 py-3.5 text-sm border-b border-[rgba(98,255,255,0.1)]">
                            {proofUrl ? (
                              <a
                                href={proofUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-[#62ffff] text-xs font-semibold border border-[rgba(98,255,255,0.3)] px-2.5 py-1 rounded-md hover:bg-[rgba(98,255,255,0.1)] hover:border-[#62ffff] transition-colors"
                              >
                                <Download size={12} /> Download
                              </a>
                            ) : (
                              <span className="text-[#334155] text-xs italic">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ── Right sidebar: Notifications ── */}
        <aside className="max-md:hidden">
          <div className="bg-[#14171e] border border-[#1e293b] rounded-xl overflow-hidden sticky top-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#94a3b8]" />
                <h3 className="text-sm font-semibold m-0">Notifications</h3>
              </div>
              {unreadNotifications.length > 0 && (
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadNotifications.length} new
                </span>
              )}
            </div>

            <div className="divide-y divide-[#1e293b]">
              {unreadNotifications.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CheckCircle2 size={24} className="text-[#334155] mx-auto mb-2" />
                  <p className="text-[#94a3b8] text-sm">All caught up!</p>
                </div>
              ) : (
                unreadNotifications.map(n => (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 bg-blue-500/5 border-l-2 border-l-blue-500 hover:bg-[#1a1f2e] transition-colors cursor-pointer"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-[#1e2433] flex items-center justify-center">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-200 leading-[1.4] m-0 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {getTimeAgo(n.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#1e293b]">
              <button
                className="w-full py-2 bg-transparent border-none text-blue-500 text-[12px] font-semibold cursor-pointer rounded-md hover:bg-blue-500/10 transition-colors text-center"
                onClick={() => navigate('/dashboard/notifications')}
              >
                View All Notifications
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CustomerDashboard;
