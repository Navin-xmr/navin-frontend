import React, { useState, useEffect } from "react";
import { Calendar, Download, Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import html2pdf from "html2pdf.js";

interface KPIData {
  totalRevenue: number;
  momChangePercent: number;
  avgPerShipment: number;
}

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

const generateMockData = (startDate: Date, endDate: Date) => {
  const monthsDiff = Math.max(
    1,
    Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  );

  const monthlyData: MonthlyData[] = Array.from({ length: Math.min(12, monthsDiff) }).map((_, i) => {
    const date = new Date(endDate);
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
      actual: Math.floor(Math.random() * 80000 + 20000),
      target: Math.floor(Math.random() * 85000 + 25000),
    };
  }).reverse();

  const serviceTypeData: ServiceTypeData[] = [
    { name: "Express", value: Math.floor(Math.random() * 45000 + 10000) },
    { name: "Standard", value: Math.floor(Math.random() * 55000 + 20000) },
    { name: "Economy", value: Math.floor(Math.random() * 35000 + 5000) },
  ];

  const regionData: RegionData[] = [
    { region: "North", revenue: Math.floor(Math.random() * 50000 + 15000) },
    { region: "South", revenue: Math.floor(Math.random() * 45000 + 12000) },
    { region: "East", revenue: Math.floor(Math.random() * 40000 + 10000) },
    { region: "West", revenue: Math.floor(Math.random() * 48000 + 14000) },
  ];

  const customers: Customer[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `cust_${i}`,
    name: `Customer ${String.fromCharCode(65 + i)}`,
    revenue: Math.floor(Math.random() * 25000 + 5000),
  })).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = serviceTypeData.reduce((sum, item) => sum + item.value, 0);
  const avgPerShipment = Math.floor(totalRevenue / (Math.random() * 500 + 100));
  const momChangePercent = Math.floor(Math.random() * 20 - 10);

  return {
    kpi: { totalRevenue, momChangePercent, avgPerShipment },
    monthlyData,
    serviceTypeData,
    regionData,
    customers,
  };
};

const RevenueAnalytics: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState(() =>
    generateMockData(new Date(startDate), new Date(endDate))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(generateMockData(new Date(startDate), new Date(endDate)));
    }, 300);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  const handleExportPDF = () => {
    const element = document.getElementById("revenue-dashboard");
    if (!element) return;

    const opt = {
      margin: 10,
      filename: "revenue-analytics.pdf",
      image: { type: "png" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 font-sans text-white max-md:px-4 max-md:pb-20">
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                    }}
                  />
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                    }}
                  />
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                    }}
                  />
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
    </div>
  );
};

export default RevenueAnalytics;
