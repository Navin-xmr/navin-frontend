import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Menu,
  RefreshCw,
  Save,
} from "lucide-react";

import { QuickActionsCard } from "./QuickActions";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts";

import RecentShipments from "./RecentShipments/RecentShipments";
import RecentActivityFeed from "./RecentActivity/RecentActivityFeed";
import ShipmentsMapWidget from "./ShipmentsMap/ShipmentsMapWidget";
import RevenueSummaryWidget from "./RevenueSummary/RevenueSummaryWidget";
import { CostPerRouteWidget } from "../../../components/dashboard/CostPerRouteWidget";
import { RevenueTargetWidget } from "../../../components/dashboard/RevenueTargetWidget";
import PerformanceScorecardWidget from "./Scorecard/PerformanceScorecardWidget";
import OnboardingTour, {
  isTourComplete,
  resetTourFlag,
} from "@components/onboarding/OnboardingTour";
import type { TourStep } from "@components/onboarding/OnboardingTour";
import OnboardingChecklist from "@components/onboarding/OnboardingChecklist";
import { shipmentApi } from "../../../services/api/endpoints/shipments";
import type { RouteCostData } from "../../../components/dashboard/CostPerRouteWidget/mockCostPerRouteData";
import DeliveryPerformanceWidget from "../../../components/dashboard/DeliveryPerformanceWidget/DeliveryPerformanceWidget";
import type { DeliveryPerformanceWidgetProps } from "../../../components/dashboard/DeliveryPerformanceWidget/DeliveryPerformanceWidget";
import { analyticsApi } from "../../../services/api/endpoints/analytics";
import type { KpiSummary, TimePeriod } from "../../../components/dashboard/DeliveryPerformanceWidget/mockPerformanceData";


const TrendIcon = ({ up }: { up: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {up ? (
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    ) : (
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    )}
  </svg>
);

const stats = [
  { id: "active", value: "128", trend: "12%", trendType: "positive", icon: <Truck size={18} /> },
  { id: "delivered", value: "1,420", trend: "5%", trendType: "positive", icon: <CheckCircle2 size={18} /> },
  { id: "delayed", value: "12", trend: "2%", trendType: "negative", icon: <Clock size={18} /> },
  { id: "verified", value: "45", trend: "0%", trendType: "neutral", icon: <ShieldCheck size={18} /> },
  {
    id: "active",
    label: "Active",
    value: "128",
    trend: "12%",
    trendType: "positive",
    icon: <Truck size={18} />,
  },
  {
    id: "delivered",
    label: "Delivered",
    value: "1,420",
    trend: "5%",
    trendType: "positive",
    icon: <CheckCircle2 size={18} />,
  },
  {
    id: "delayed",
    label: "Delayed",
    value: "12",
    trend: "2%",
    trendType: "negative",
    icon: <Clock size={18} />,
  },
  {
    id: "verified",
    label: "Verified",
    value: "45",
    trend: "0%",
    trendType: "neutral",
    icon: <ShieldCheck size={18} />,
  },
];

type DashboardWidgetId =
  | "map"
  | "revenue"
  | "scorecard"
  | "targets"
  | "shipments"
  | "activity"
  | "delivery-performance";

interface DashboardPreset {
  id: string;
  label: string;
  description: string;
  widgets: DashboardWidgetId[];
}

const DASHBOARD_LAYOUT_KEY = "navin_dashboard_layout_preset";
const CUSTOM_WIDGETS_KEY = "navin_dashboard_visible_widgets";

const dashboardPresets: DashboardPreset[] = [
  {
    id: "operations",
    label: "Operations",
    description: "Fleet status, shipment movement, and latest updates.",
    widgets: ["map", "scorecard", "shipments", "activity"],
  },
  {
    id: "finance",
    label: "Finance",
    description: "Revenue, settlement targets, and route costs.",
    widgets: ["revenue", "targets", "shipments", "activity"],
  },
  {
    id: "overview",
    label: "Overview",
    description: "Balanced view for daily logistics reviews.",
    widgets: ["map", "revenue", "scorecard", "targets", "shipments", "activity"],
  },
];

const widgetLabels: Record<DashboardWidgetId, string> = {
  map: "Fleet map",
  revenue: "Revenue summary",
  scorecard: "Performance scorecard",
  targets: "Revenue and route costs",
  shipments: "Recent shipments",
  activity: "Recent activity",
  "delivery-performance": "Delivery performance",
};

const defaultWidgetIds = dashboardPresets[2].widgets;

const CompanyDashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [routeCostData, setRouteCostData] = useState<RouteCostData[]>([]);
  const [routeCostLoading, setRouteCostLoading] = useState(true);
  const [routeCostError, setRouteCostError] = useState<string | null>(null);
  const [deliveryPerformanceData, setDeliveryPerformanceData] = useState<DeliveryPerformanceWidgetProps['data'] | undefined>(undefined);
  const [activePresetId, setActivePresetId] = useState(() => {
    try {
      return localStorage.getItem(DASHBOARD_LAYOUT_KEY) ?? "overview";
    } catch {
      return "overview";
    }
  });
  const [visibleWidgets, setVisibleWidgets] = useState<DashboardWidgetId[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_WIDGETS_KEY);
      if (!saved) return defaultWidgetIds;
      const parsed = JSON.parse(saved) as DashboardWidgetId[];
      return parsed.filter((id) => id in widgetLabels);
    } catch {
      return defaultWidgetIds;
    }
  });

  useKeyboardShortcuts([
    {
      key: "R",
      alt: true,
      callback: () => handleRefresh(),
      label: "Refresh Dashboard",
    },
  ]);

  const TOUR_STEPS: TourStep[] = [
    {
      targetId: 'tour-welcome',
      heading: t('companyDashboard.tour.welcome.heading'),
      body: t('companyDashboard.tour.welcome.body'),
      placement: 'bottom',
    },
    {
      targetId: 'tour-create-shipment',
      heading: t('companyDashboard.tour.createShipment.heading'),
      body: t('companyDashboard.tour.createShipment.body'),
      placement: 'bottom',
    },
    {
      targetId: 'tour-shipments-link',
      heading: t('companyDashboard.tour.trackShipments.heading'),
      body: t('companyDashboard.tour.trackShipments.body'),
      placement: 'right',
    },
    {
      targetId: 'tour-settlements-link',
      heading: t('companyDashboard.tour.settlements.heading'),
      body: t('companyDashboard.tour.settlements.body'),
      placement: 'right',
    },
    {
      targetId: 'tour-wallet',
      heading: t('companyDashboard.tour.wallet.heading'),
      body: t('companyDashboard.tour.wallet.body'),
      placement: 'bottom',
    },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
        setLastRefreshed(new Date());
        if (!isTourComplete()) setShowTour(true);
      } catch {
        setHasError(true);
        setIsLoading(false);
      }
    };
    void fetchDashboardData();
  }, [refreshKey]);

  // Fetch shipments and derive per-route cost aggregations for CostPerRouteWidget
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRouteCostLoading(true);
    setRouteCostError(null);
    shipmentApi
      .getAll({ limit: 200 })
      .then((res) => {
        if (cancelled) return;
        // Group shipments by origin → destination route
        const routeMap = new Map<string, RouteCostData>();
        for (const shipment of res.data) {
          const routeKey = `${shipment.origin} → ${shipment.destination}`;
          const meta = shipment.offChainMetadata ?? {};
          const shipmentCost = typeof meta.totalCost === 'number' ? meta.totalCost : 0;
          const shipmentRevenue = typeof meta.revenue === 'number' ? meta.revenue : 0;
          if (!routeMap.has(routeKey)) {
            routeMap.set(routeKey, {
              route: routeKey,
              origin: shipment.origin,
              destination: shipment.destination,
              base: 0,
              fuel: 0,
              customs: 0,
              insurance: 0,
              revenue: 0,
              shipments: [],
            });
          }
          const entry = routeMap.get(routeKey)!;
          entry.revenue += shipmentRevenue;
          entry.base += shipmentCost;
          entry.shipments.push({
            id: shipment._id,
            trackingNumber: shipment.trackingNumber,
            cost: shipmentCost,
            revenue: shipmentRevenue,
          });
        }
        setRouteCostData(Array.from(routeMap.values()));
        setRouteCostLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setRouteCostError('Failed to load route cost data.');
          setRouteCostLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Fetch analytics summary and derive DeliveryPerformanceWidget data
  useEffect(() => {
    analyticsApi
      .getSummary()
      .then((summary) => {
        const makeTrend = (sparkline: number[]): { date: string; value: number }[] => {
          const today = new Date();
          return sparkline.map((value, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (sparkline.length - 1 - i));
            return { date: d.toISOString().slice(0, 10), value };
          });
        };

        const onTimeTrend = makeTrend(summary.onTimeDeliverySparkline);
        const transitTrend = makeTrend(summary.averageTransitDaysSparkline);
        const disputeTrend = makeTrend(summary.disputeRateSparkline);
        const volumeTrend = makeTrend(summary.totalShipmentsSparkline);

        const buildKpis = (_period: TimePeriod): KpiSummary[] => [
          {
            key: 'onTimeRate',
            label: 'On-Time Delivery Rate',
            unit: '%',
            current: summary.onTimeDeliveryRate,
            previous: summary.onTimeDeliveryRatePrev,
            trend: onTimeTrend,
          },
          {
            key: 'avgDeliveryTime',
            label: 'Average Delivery Time',
            unit: 'days',
            current: summary.averageTransitDays,
            previous: summary.averageTransitDaysPrev,
            trend: transitTrend,
          },
          {
            key: 'exceptionRate',
            label: 'Exception Rate',
            unit: '%',
            current: summary.disputeRate,
            previous: summary.disputeRatePrev,
            trend: disputeTrend,
          },
          {
            key: 'firstAttemptRate',
            label: 'First Attempt Success Rate',
            unit: '%',
            current: summary.totalShipmentsThisMonth,
            previous: summary.totalShipmentsThisMonthPrev,
            trend: volumeTrend,
          },
        ];
        // All three periods use the same summary (API returns a single snapshot)
        const periods: TimePeriod[] = ['7d', '30d', '90d'];
        setDeliveryPerformanceData(
          Object.fromEntries(periods.map((p) => [p, buildKpis(p)])) as Record<TimePeriod, KpiSummary[]>,
        );
      })
      .catch(() => {
        // Non-critical — widget falls back to its built-in mock default
      });
  }, [refreshKey]);

  const refreshedLabel = useMemo(() => {
    if (!lastRefreshed) return "Awaiting first refresh";
    return `Last refreshed ${lastRefreshed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }, [lastRefreshed]);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    setRefreshKey((value) => value + 1);
  };

  const handlePresetChange = (presetId: string) => {
    const preset = dashboardPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setVisibleWidgets(preset.widgets);
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, preset.id);
    localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(preset.widgets));
  };

  const handleWidgetToggle = (widgetId: DashboardWidgetId) => {
    setVisibleWidgets((current) => {
      const next = current.includes(widgetId)
        ? current.filter((id) => id !== widgetId)
        : [...current, widgetId];
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, "custom");
      localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify(next));
      setActivePresetId("custom");
      return next;
    });
  };

  const isWidgetVisible = (widgetId: DashboardWidgetId) =>
    visibleWidgets.includes(widgetId);

  if (hasError) {
    return (
      <div className="w-full max-w-[1080px] mx-auto px-[46px] py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-[#14171e] border border-dashed border-[#ef4444] rounded-xl text-center">
          <AlertTriangle size={48} className="text-[#ef4444] mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('companyDashboard.errorTitle')}</h3>
          <p className="text-[#94a3b8] text-sm mb-4">{t('companyDashboard.errorBody')}</p>
          <button className="bg-[#ef4444] text-white border-none px-4 py-2 rounded-md font-medium cursor-pointer" onClick={() => window.location.reload()}>
            {t('companyDashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-white bg-transparent w-full max-w-[1080px] mx-auto min-h-[calc(100vh-72px)] px-[46px] py-6 flex flex-col gap-8 max-md:px-4 max-md:gap-6 max-md:pb-[90px]">
      {showTour && (
        <OnboardingTour steps={TOUR_STEPS} onClose={() => setShowTour(false)} />
      )}

      {/* Mobile branded header */}
      <div className="hidden max-md:flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#3b82f6] rounded-[10px] flex items-center justify-center">
            <Rocket size={16} color="#fff" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-widest">
            NAVIN
          </span>
        </div>
        <button className="bg-transparent border-none cursor-pointer p-1 flex items-center" aria-label={t('companyDashboard.menuAriaLabel')}>
          <Menu size={22} color="#fff" />
        </button>
      </div>

      {/* Title */}
      <div
        className="flex justify-between items-end max-md:flex-col max-md:items-start max-md:gap-1"
        data-tour-id="tour-welcome"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight m-0 mb-1 max-md:text-[22px] max-md:font-bold">{t('companyDashboard.title')}</h1>
          <p className="text-[#94a3b8] text-sm m-0">{t('companyDashboard.subtitle')}</p>
        </div>
        <div className="max-md:hidden flex items-center gap-1.5 bg-[#14171e] border border-[#1e293b] px-3 py-1.5 rounded-md text-xs font-medium text-[#94a3b8]">
          {t('companyDashboard.live')} <span className="text-[#10b981]">{t('companyDashboard.connected')}</span>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#64748b] mt-1">
            {refreshedLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetTourFlag();
              setShowTour(true);
            }}
            aria-label="Restart onboarding tour"
            className="max-md:hidden inline-flex items-center gap-2 rounded-md border border-[#1e293b] bg-[#14171e] px-3 py-1.5 text-xs font-medium text-[#94a3b8] transition-colors hover:border-[#62ffff] hover:text-[#62ffff]"
          >
            Tour
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-[#1e293b] bg-[#14171e] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-colors hover:border-[#3b82f6] hover:text-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {!isLoading && <OnboardingChecklist />}
      <section
        className="rounded-xl border border-[#1e293b] bg-[#14171e] p-4"
        aria-labelledby="dashboard-layout-heading"
      >
        <div className="flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <h2
              id="dashboard-layout-heading"
              className="m-0 flex items-center gap-2 text-sm font-semibold text-white"
            >
              <Save size={16} className="text-[#62ffff]" />
              Saved dashboard layout
            </h2>
            <p className="mt-1 text-xs text-[#94a3b8]">
              Choose a preset or show only the widgets needed for your current workflow.
            </p>
          </div>
          <select
            value={activePresetId}
            onChange={(event) => handlePresetChange(event.target.value)}
            className="rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-2 text-sm text-white outline-none transition-colors hover:border-[#62ffff] focus:border-[#62ffff] max-md:w-full"
            aria-label="Dashboard layout preset"
          >
            {dashboardPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          {(Object.keys(widgetLabels) as DashboardWidgetId[]).map((widgetId) => (
            <label
              key={widgetId}
              className="flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-2 text-xs text-[#cbd5e1]"
            >
              <input
                type="checkbox"
                checked={isWidgetVisible(widgetId)}
                onChange={() => handleWidgetToggle(widgetId)}
                className="h-4 w-4 accent-[#62ffff]"
              />
              {widgetLabels[widgetId]}
            </label>
          ))}
        </div>
      </section>

      {/* Stats + Quick Actions: two-column on desktop */}
      <div className="grid grid-cols-[1fr_300px] gap-6 items-start max-md:grid-cols-1 max-md:gap-3">
        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-6 max-md:gap-3">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[120px] rounded-xl animate-shimmer" />
              ))
            : stats.map((stat) => (
              <div key={stat.id} className="bg-[#14171e] border border-[#1e293b] rounded-xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#334155] max-md:p-4">
                <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold uppercase tracking-[0.05em] mb-4">
                  {stat.icon}{t(`companyDashboard.stats.${stat.id}`)}
                </div>
                <div
                  className={`text-[32px] font-semibold mb-2 max-md:text-[28px] ${stat.id === "delayed" ? "text-[#f59e0b]" : "text-white"}`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-[13px] font-medium flex items-center gap-1 ${
                    stat.trendType === "positive"
                      ? "text-[#10b981]"
                      : stat.trendType === "negative"
                        ? "text-[#ef4444]"
                        : "text-[#94a3b8]"
                  }`}
                >
                  <TrendIcon up={stat.trendType === "positive"} />
                  {stat.trend}
                </div>
              </div>
            ))}
        </div>

        {/* Quick Actions — top-right, desktop only */}
        <div className="max-md:hidden" data-tour-id="tour-create-shipment">
          <QuickActionsCard />
        </div>
      </div>

      {/* Shipments map */}
      {isWidgetVisible("map") && (
        <div className="flex flex-col">
          <div className="mb-4">
            <ShipmentsMapWidget />
          </div>
        </div>
      )}
      {isWidgetVisible("revenue") && <RevenueSummaryWidget />}
      {isWidgetVisible("scorecard") && <PerformanceScorecardWidget />}
      {isWidgetVisible("delivery-performance") && (
        <DeliveryPerformanceWidget data={deliveryPerformanceData} />
      )}

      {isWidgetVisible("targets") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueTargetWidget />
          <CostPerRouteWidget
            data={routeCostData}
            loading={routeCostLoading}
            error={routeCostError}
            onRetry={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      )}

      {/* Shipments */}
      {isWidgetVisible("shipments") && <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[13px] font-semibold text-[#64748b] uppercase tracking-[0.05em] m-0 max-md:text-lg max-md:font-bold max-md:text-white max-md:normal-case max-md:tracking-normal">
            {t('companyDashboard.recentShipments')}
          </h2>
          <a href="#" className="text-[13px] font-medium text-[#94a3b8] no-underline transition-colors hover:text-white max-md:text-[#3b82f6] max-md:font-semibold">
            {t('companyDashboard.viewAll')}
          </a>
        </div>

        <div className="border border-[rgba(30,41,59,0.5)] rounded-xl overflow-hidden max-md:bg-transparent max-md:border-none">
          <RecentShipments />
        </div>
      </div>}

      {/* Recent Activity */}
      {isWidgetVisible("activity") && <div className="flex flex-col">
        <RecentActivityFeed />
      </div>}

      {/* Active Fleet — desktop only */}
      {!isLoading && (
        <div className="max-md:hidden bg-[#14171e] border border-[#1e293b] rounded-xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[rgba(79,70,229,0.1)] text-[#4f46e5] rounded-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="m-0 mb-0.5 text-sm font-semibold">{t('companyDashboard.activeFleetRoutes')}</h3>
              <p className="m-0 text-xs text-[#94a3b8]">{t('companyDashboard.driversActive', { count: 12 })}</p>
            </div>
          </div>
          <div className="flex items-center">
            {[
              { seed: "Felix", bg: "b6e3f4" },
              { seed: "Aneka", bg: "c0aede" },
              { seed: "Jack", bg: "ffdfbf" },
            ].map((a, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#14171e] -ml-2 first:ml-0 bg-[#334155] overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.seed}&backgroundColor=${a.bg}`} alt={t('companyDashboard.driverAlt')} className="w-full h-full object-cover" />
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
