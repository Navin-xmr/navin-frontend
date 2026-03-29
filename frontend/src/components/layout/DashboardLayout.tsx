import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Database,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  ShieldCheck,
  X,
  CreditCard,
  Bell,
  User,
  History,
} from 'lucide-react';
import TopHeader from './TopHeader/TopHeader';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mainMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Shipments', icon: <Package size={18} />, path: '/dashboard/shipments' },
    { name: 'Shipment History', icon: <History size={18} />, path: '/dashboard/shipments/history' },
    { name: 'Blockchain Ledger', icon: <Database size={18} />, path: '/dashboard/blockchain-ledger' },
    { name: 'Settlements', icon: <Wallet size={18} />, path: '/dashboard/settlements' },
    { name: 'Payments', icon: <CreditCard size={18} />, path: '/dashboard/payments' },
    { name: 'Analytics', icon: <BarChart3 size={18} />, path: '/dashboard/analytics' },
    { name: 'Notifications', icon: <Bell size={18} />, path: '/dashboard/notifications' },
  ];

  const systemMenu = [
    { name: 'Profile', icon: <User size={18} />, path: '/dashboard/profile' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/dashboard/settings' },
    { name: 'Help Center', icon: <HelpCircle size={18} />, path: '/dashboard/help-center' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#07090d] text-white font-sans flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-65 bg-[#0b0e14] border-r border-[#1e2433] flex flex-col shrink-0 p-6
          lg:relative lg:translate-x-0
          fixed top-0 left-0 h-full z-100 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 text-xl font-bold mb-12 text-[#62ffff]">
          <img src="/images/logo.svg" alt="Navin Logo" className="w-8 h-8" />
          <span>NAVIN</span>
          <button
            className="ml-auto flex lg:hidden bg-transparent border-none text-slate-400 cursor-pointer"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-[11px] font-semibold uppercase text-[#8a8f9d] tracking-[0.05em] mb-4">Main Menu</h3>
          <div className="flex flex-col gap-1">
            {mainMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-none w-full text-left
                    ${isActive
                      ? 'bg-[rgba(19,186,186,0.15)] text-white border-l-[3px] border-l-[#62ffff] pl-2.25 [&_svg]:text-[#62ffff]'
                      : 'bg-transparent text-[#8a8f9d] hover:bg-[rgba(19,186,186,0.1)] hover:text-white'
                    }`}
                  onClick={() => { navigate(item.path); closeSidebar(); }}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[11px] font-semibold uppercase text-[#8a8f9d] tracking-[0.05em] mb-4">System</h3>
          <div className="flex flex-col gap-1">
            {systemMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-none w-full text-left
                    ${isActive
                      ? 'bg-[rgba(19,186,186,0.15)] text-white border-l-[3px] border-l-[#62ffff] pl-2.25 [&_svg]:text-[#62ffff]'
                      : 'bg-transparent text-[#8a8f9d] hover:bg-[rgba(19,186,186,0.1)] hover:text-white'
                    }`}
                  onClick={() => { navigate(item.path); closeSidebar(); }}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.3)] rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-[rgba(19,186,186,0.2)] rounded-[10px] flex items-center justify-center text-[#62ffff]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-0.5">Enterprise Node</h4>
              <p className="text-[11px] text-[#62ffff] flex items-center gap-1 m-0">
                <span className="w-1.5 h-1.5 bg-[#62ffff] rounded-full shadow-[0_0_8px_#62ffff]" />
                Syncing: Block 18.2M
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopHeader toggleSidebar={toggleSidebar} />
        <main className="p-8 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
