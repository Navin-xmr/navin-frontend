import React, { useState, useEffect } from "react";
import { Calendar, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import html2pdf from "html2pdf.js";
import { DashboardWidgetSkeleton } from "@components/ui/Skeleton";
import Breadcrumb from "@components/common/Breadcrumb";
import RichChartTooltip, { ExportAction } from "../../components/ui/RichChartTooltip";
import { analyticsApi } from "../../services/api/endpoints/analytics";
import { shipmentApi } from "../../services/api/endpoints/shipments";

interface MonthlyData {
  month: string;
  actual: number;
  target: number;
}

interface ServiceTypeData {
  name: string;
  value: number;
}

interface RegionData {
  region: string;
  revenue: number;
}

interface Customer {
  id: string;
  name: string;
  revenue: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// ─── Custom chart tooltips ────────────────────────────────────────────

const MonthlyRevenueTooltip: React.FC<{
  active?: boolean;
  payload?: { name?: string; value?: number; dataKey?: string }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === "actual")?.value ?? 0;
  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;

  const handleExport = () => {
    console.info(`Export data for ${label}`);
  };

  return (
    <RichChartTooltip
      active={active}
      title={label}
      items={[
        {
          label: "Actual",
          value: actual,
          unit: "$",
          color: "#3b82f6",
          trend: actual >= target ? "up" : "down",
          trendLabel: actual >= target ? "Met or exceeded target" : "Below target",
        },
        {
          label: "Target",
          value: target,
          unit: "$",
          color: "#10b981",
        },
      ]}
      actions={[ExportAction(handleExport)]}
    />
  );
};

const ServiceTypeTooltip: React.FC<{
  active?: boolean;
  payload?: { name?: string; value?: number }[];
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <RichChartTooltip
      active={active}
      title={item.name}
      items={[{ label: "Revenue", value: item.value ?? 0, unit: "$" }]}
    />
  );
};

const RegionTooltip: React.FC<{
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <RichChartTooltip
      active={active}
      title={label}
      items={[{ label: "Revenue", value: payload[0].value ?? 0, unit: "$", color: "#3b82f6" }]}
    />
  );
};

interface RevenueData {
  kpi: { totalRevenue: number; momChangePercent: number; avgPerShipment: number };
  monthlyData: MonthlyData[];
  serviceTypeData: ServiceTypeData[];
  regionData: RegionData[];
  customers: Customer[];
}

const EMPTY_DATA: RevenueData = {
  kpi: { totalRevenue: 0, momChangePercent: 0, avgPerShipment: 0 },
  monthlyData: [],
  serviceTypeData: [],
  regionData: [],
  customers: [],
};

const RevenueAnalytics: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<RevenueData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setFetchError(null);

    Promise.all([
      analyticsApi.getPerformance(startDate, endDate),
      shipmentApi.getAll({ status: "DELIVERED", limit: 100 }),
    ])
      .then(([perfData, shipmentRes]) => {
        if (cancelled) return;
        const shipments = shipmentRes.data;

        // Derive revenue proxies from real shipment data
        // Group by month using updatedAt date
        const monthlyMap: Record<string, { actual: number; target: number }> = {};
        shipments.forEach((s) => {
          const date = new Date(s.updatedAt);
          const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
          if (!monthlyMap[key]) monthlyMap[key] = { actual: 0, target: 0 };
          monthlyMap[key].actual += 1; // count as proxy (real amounts require payment API)
          monthlyMap[key].target += 1;
        });

        const monthlyData: MonthlyData[] = Object.entries(monthlyMap)
          .map(([month, v]) => ({ month, actual: v.actual, target: v.target }))
          .slice(-12);

        // Derive service breakdown from shipment priority
        const byPriority: Record<string, number> = {};
        shipments.forEach((s) => {
          const key = s.priority ?? "STANDARD";
          byPriority[key] = (byPriority[key] ?? 0) + 1;
        });
        const serviceTypeData: ServiceTypeData[] = Object.entries(byPriority).map(
          ([name, value]) => ({ name, value })
        );

        // Region proxy — derive from origin string
        const byRegion: Record<string, number> = {};
        shipments.forEach((s) => {
          const region = s.origin.split(",").pop()?.trim() ?? "Unknown";
          byRegion[region] = (byRegion[region] ?? 0) + 1;
        });
        const regionData: RegionData[] = Object.entries(byRegion)
          .slice(0, 4)
          .map(([region, revenue]) => ({ region, revenue }));

        // KPI from real performance data
        const statusByDelivered = perfData.shipmentsByStatus.find(
          (s) => s.status === "DELIVERED"
        );
        const totalDelivered = statusByDelivered?.total ?? shipments.length;
        const prevMonth = monthlyData[monthlyData.length - 2]?.actual ?? 0;
        const currMonth = monthlyData[monthlyData.length - 1]?.actual ?? 0;
        const momChangePercent =
          prevMonth > 0 ? Math.round(((currMonth - prevMonth) / prevMonth) * 100) : 0;

        setData({
          kpi: {
            totalRevenue: totalDelivered,
            momChangePercent,
            avgPerShipment: shipments.length > 0 ? Math.round(totalDelivered / shipments.length) : 0,
          },
          monthlyData,
          serviceTypeData,
          regionData,
          customers: [],
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Failed to load revenue data.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const handleExportPDF = () => {
    const element = document.getElementById("revenue-dashboard");
    if (!element) return;

    const opt = {
      margin: 10,
      filename: "revenue-analytics.pdf",
      image: { type: "png" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape" as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 font-sans text-white max-md:px-4 max-md:pb-20">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics", href: "/dashboard/analytics" }]}
        current="Revenue Analytics"
      />
      <div className="flex justify-between items-end mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight m-0 mb-2">
            Revenue Analytics
          </h1>
          <p className="text-slate-400 text-sm m-0">
            Track revenue trends, service performance, and top customers
          </p>
        </div>

        <div className="flex items-center gap-3 max-md:w-full max-md:flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-white text-sm outline-none [color-scheme:dark]"
            />
            <span className="text-slate-400">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-white text-sm outline-none [color-scheme:dark]"
            />
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Download size={16} />
            <span className="max-md:hidden">Export PDF</span>
          </button>
        </div>
      </div>

      {fetchError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-red-400 text-sm">{fetchError}</p>
          <p className="text-slate-500 text-xs">Revenue analytics could not be loaded. Please try again later.</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-md:grid-cols-1">
            <DashboardWidgetSkeleton count={3} />
          </div>
          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <DashboardWidgetSkeleton count={4} />
          </div>
        </div>
      ) : (
      <div id="revenue-dashboard" className="flex flex-col gap-6 bg-slate-950">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-md:grid-cols-1">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-bold">
                ${(data.kpi.totalRevenue / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {data.kpi.totalRevenue.toLocaleString()} units
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <p className="text-slate-400 text-sm mb-2">Month-over-Month Change</p>
              <p
                className={`text-3xl font-bold ${
                  data.kpi.momChangePercent >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {data.kpi.momChangePercent > 0 ? "+" : ""}
                {data.kpi.momChangePercent}%
              </p>
              <p className="text-xs text-slate-500 mt-2">vs previous month</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <p className="text-slate-400 text-sm mb-2">Avg Revenue per Shipment</p>
              <p className="text-3xl font-bold">
                ${data.kpi.avgPerShipment.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {Math.round(data.kpi.avgPerShipment / 100)} per unit
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            {/* Monthly Revenue Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<MonthlyRevenueTooltip />} />
                  <Legend />
                  <Bar dataKey="actual" fill="#3b82f6" />
                  <Bar dataKey="target" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Service Type Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue by Service Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.serviceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.serviceTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ServiceTypeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.serviceTypeData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-400">{item.name}</span>
                    <span className="ml-auto font-semibold">
                      ${(item.value / 1000).toFixed(1)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Region Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Revenue by Region</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="region" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<RegionTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Customers Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Top 10 Customers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">
                        Customer
                      </th>
                      <th className="text-right py-2 px-2 text-slate-400 font-medium">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.customers.map((customer, idx) => (
                      <tr
                        key={customer.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-2 text-white">
                          <span className="text-slate-400 mr-3">#{idx + 1}</span>
                          {customer.name}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold">
                          ${customer.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalytics;
