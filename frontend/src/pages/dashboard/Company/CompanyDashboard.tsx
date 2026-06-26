import React, { useState, useEffect } from "react";
import {
  Box, Clock, CheckCircle2, Truck,
  Ship, Plane, Train, ShieldCheck, AlertTriangle,
  Rocket, Menu, QrCode, MoreHorizontal,
} from "lucide-react";

import { getStatusDisplayLabel, getStatusBadgeClass, getStatusDotClass } from '../../../utils/shipmentStatus';
import { QuickActionsCard } from './QuickActions';

const getStatusKey = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'DELIVERED';
    case 'IN-TRANSIT':
    case 'IN_TRANSIT':
      return 'IN_TRANSIT';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'CREATED';
  }
};

const getTransportIcon = (type: string) => {
  switch (type) {
    case "ship": return <Ship size={20} strokeWidth={1.5} />;
    case "plane": return <Plane size={20} strokeWidth={1.5} />;
    case "train": return <Train size={20} strokeWidth={1.5} />;
    default: return <Box size={20} strokeWidth={1.5} />;
  }
};
  Clock, CheckCircle2, Truck,
  ShieldCheck, AlertTriangle,
  Rocket, Menu,
} from "lucide-react";

import { QuickActionsCard } from './QuickActions';
import RecentShipments from './RecentShipments/RecentShipments';
import RecentActivityFeed from './RecentActivity/RecentActivityFeed';
import ShipmentsMapWidget from './ShipmentsMap/ShipmentsMapWidget';
import RevenueSummaryWidget from './RevenueSummary/RevenueSummaryWidget';
import OnboardingTour, { isTourComplete } from '@components/onboarding/OnboardingTour';
import type { TourStep } from '@components/onboarding/OnboardingTour';

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-welcome',
    heading: 'Welcome to Navin 🎉',
    body: 'This is your logistics command center. Monitor shipments, track performance, and manage your team — all in one place.',
    placement: 'bottom',
  },
  {
    targetId: 'tour-create-shipment',
    heading: 'Create Your First Shipment',
    body: 'Click here to create a new shipment, assign routes, set milestones, and configure automated settlements.',
    placement: 'bottom',
  },
  {
    targetId: 'tour-shipments-link',
    heading: 'Track Shipments',
    body: 'View all active and historical shipments with real-time on-chain milestone updates and IoT sensor data.',
    placement: 'right',
  },
  {
    targetId: 'tour-settlements-link',
    heading: 'Automated Settlements',
    body: 'Settlements trigger automatically when delivery milestones are verified on the Stellar blockchain.',
    placement: 'right',
  },
  {
    targetId: 'tour-wallet',
    heading: 'Connect Your Stellar Wallet',
    body: 'Connect your Stellar wallet to sign settlement transactions and interact with Soroban smart contracts.',
    placement: 'bottom',
  },
];

const TrendIcon = ({ up }: { up: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {up
      ? <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      : <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />}
  </svg>
);

const stats = [
  { id: "active", label: "Active", value: "128", trend: "12%", trendType: "positive", icon: <Truck size={18} /> },
  { id: "delivered", label: "Delivered", value: "1,420", trend: "5%", trendType: "positive", icon: <CheckCircle2 size={18} /> },
  { id: "delayed", label: "Delayed", value: "12", trend: "2%", trendType: "negative", icon: <Clock size={18} /> },
  { id: "verified", label: "Verified", value: "45", trend: "0%", trendType: "neutral", icon: <ShieldCheck size={18} /> },
];

const CompanyDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
        if (!isTourComplete()) setShowTour(true);
      } catch {
        setHasError(true);
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (hasError) {
    return (
      <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#ef4444] rounded-xl text-center">
          <AlertTriangle size={48} className="text-[#ef4444] mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-[#94a3b8] text-sm mb-4">There was a problem connecting to the logistics network.</p>
          <button className="bg-[#ef4444] text-white border-none px-4 py-2 rounded-md font-medium cursor-pointer" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-white bg-transparent w-full max-w-[1080px] mx-auto min-h-[calc(100vh-72px)] px-[46px] py-6 flex flex-col gap-8 max-md:px-4 max-md:gap-6 max-md:pb-[90px]">

      {showTour && <OnboardingTour steps={TOUR_STEPS} onClose={() => setShowTour(false)} />}

      {/* Mobile branded header */}
      <div className="hidden max-md:flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#3b82f6] rounded-[10px] flex items-center justify-center">
            <Rocket size={16} color="#fff" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-widest">NAVIN</span>
        </div>
        <button className="bg-transparent border-none cursor-pointer p-1 flex items-center" aria-label="Menu">
          <Menu size={22} color="#fff" />
        </button>
      </div>

      {/* Title */}
      <div className="flex justify-between items-end max-md:flex-col max-md:items-start max-md:gap-1" data-tour-id="tour-welcome">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1 max-md:text-[22px] max-md:font-bold">Logistics Overview</h1>
          <p className="text-[#94a3b8] text-sm m-0">Blockchain-synced real-time data</p>
        </div>
        <div className="max-md:hidden flex items-center gap-1.5 bg-[#14171e] border border-[#1e293b] px-3 py-1.5 rounded-md text-xs font-medium text-[#94a3b8]">
          Live: <span className="text-[#10b981]">Connected</span>
        </div>
      </div>

      {/* Stats + Quick Actions: two-column on desktop */}
      <div className="grid grid-cols-[1fr_300px] gap-6 items-start max-md:grid-cols-1 max-md:gap-3">
        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-6 max-md:gap-3">
          {isLoading
            ? [1, 2, 3, 4].map((i) => <div key={i} className="h-[120px] rounded-xl animate-shimmer" />)
            : stats.map((stat) => (
              <div key={stat.id} className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#334155] max-md:p-4">
                <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em] mb-4">
                  {stat.icon}{stat.label}
                </div>
                <div className={`text-[32px] font-semibold mb-2 max-md:text-[28px] ${stat.id === "delayed" ? "text-[#f59e0b]" : "text-white"}`}>
                  {stat.value}
                </div>
                <div className={`text-[13px] font-medium flex items-center gap-1 ${stat.trendType === "positive" ? "text-[#10b981]" :
                  stat.trendType === "negative" ? "text-[#ef4444]" : "text-[#94a3b8]"
                  }`}>
                  <TrendIcon up={stat.trendType === "positive"} />{stat.trend}
                </div>
              </div>
            ))
          }
        </div>

        {/* Quick Actions — top-right, desktop only */}
        <div className="max-md:hidden">
          <QuickActionsCard />

        {/* Quick Actions — top-right, desktop only */}
        <div className="max-md:hidden" data-tour-id="tour-create-shipment">
          <QuickActionsCard />
        </div>
      </div>

      {/* Shipments map */}
      <div className="flex flex-col">
        <div className="mb-4">
          <ShipmentsMapWidget />
        </div>
      </div>
      <RevenueSummaryWidget />

      {/* Shipments */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0 max-md:text-lg max-md:font-bold max-md:text-white max-md:normal-case max-md:tracking-normal">
            Recent Shipments
          </h2>
          <a href="#" className="text-[13px] font-medium text-[#94a3b8] no-underline transition-colors hover:text-white max-md:text-[#3b82f6] max-md:font-semibold">
            View All
          </a>
        </div>

        <div className="border border-[rgba(30,41,59,0.5)] rounded-xl overflow-hidden max-md:bg-transparent max-md:border-none">
          <RecentShipments />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col">
        <RecentActivityFeed />
      </div>


      {/* Active Fleet — desktop only */}
      {!isLoading && (
        <div className="max-md:hidden bg-[#14171e] border border-[#1e293b] rounded-xl px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[rgba(79,70,229,0.1)] text-[#4f46e5] rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="m-0 mb-0.5 text-sm font-semibold">Active Fleet Routes</h3>
              <p className="m-0 text-xs text-[#94a3b8]">12 drivers currently active</p>
            </div>
          </div>
          <div className="flex items-center">
            {[
              { seed: "Felix", bg: "b6e3f4" },
              { seed: "Aneka", bg: "c0aede" },
              { seed: "Jack", bg: "ffdfbf" },
            ].map((a, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#14171e] -ml-2 first:ml-0 bg-[#334155] overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.seed}&backgroundColor=${a.bg}`} alt="Driver" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-[#14171e] -ml-2 bg-[#334155] flex items-center justify-center text-[11px] font-semibold text-white">
              +9
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
