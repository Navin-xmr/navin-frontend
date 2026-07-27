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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import TopHeader from './TopHeader/TopHeader';
import AnimatedPage from './AnimatedPage';
import { SessionTimeoutModal } from '../auth/SessionTimeoutModal';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Main Menu': true,
    'System': false,
  });

  const navGroups: NavGroup[] = [
    {
      label: 'Main Menu',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        { name: 'Shipments', icon: <Package size={18} />, path: '/dashboard/shipments' },
        { name: 'Shipment History', icon: <History size={18} />, path: '/dashboard/shipments/history' },
        { name: 'Blockchain Ledger', icon: <Database size={18} />, path: '/dashboard/blockchain-ledger' },
        { name: 'Settlements', icon: <Wallet size={18} />, path: '/dashboard/settlements' },
        { name: 'Payments', icon: <CreditCard size={18} />, path: '/dashboard/payments' },
        { name: 'Analytics', icon: <BarChart3 size={18} />, path: '/dashboard/analytics' },
        { name: 'Notifications', icon: <Bell size={18} />, path: '/dashboard/notifications' },
      ],
    },
    {
      label: 'System',
      items: [
        { name: 'Profile', icon: <User size={18} />, path: '/dashboard/profile' },
        { name: 'Settings', icon: <Settings size={18} />, path: '/dashboard/settings' },
        { name: 'Help Center', icon: <HelpCircle size={18} />, path: '/dashboard/help-center' },
      ],
    },
  ];

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  const toggleGroup = (label: string) => {
    if (isCollapsed) return; // groups don't expand when sidebar is collapsed
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isGroupOpen = (label: string) => !isCollapsed && (openGroups[label] ?? true);

  const handleNavClick = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07090d] text-gray-900 dark:text-white font-sans flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#62ffff] focus:text-black focus:font-semibold focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

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
          bg-white dark:bg-[#0b0e14] border-r border-gray-200 dark:border-[#1e2433]
          flex flex-col shrink-0 transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          fixed top-0 left-0 h-full z-100
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-16 px-2 py-6' : 'w-64 p-6'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center mb-10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 text-xl font-bold text-teal-600 dark:text-[#62ffff]">
              <img src="/images/logo.svg" alt="Navin Logo" className="w-8 h-8" />
              <span>NAVIN</span>
            </div>
          )}

          {isCollapsed && (
            <img src="/images/logo.svg" alt="Navin Logo" className="w-8 h-8" />
          )}

          <div className="flex items-center gap-1">
            {/* Collapse toggle — large screens only */}
            <button
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 dark:text-[#8a8f9d] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white transition-all border-none bg-transparent cursor-pointer"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile close */}
            <button
              className="flex lg:hidden items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden" aria-label="Site navigation">
          {navGroups.map(group => (
            <div key={group.label} className={isCollapsed ? 'mb-4' : 'mb-6'}>
              {/* Group header — hidden when collapsed */}
              {!isCollapsed && (
                <button
                  className="w-full flex items-center justify-between px-1 mb-2 bg-transparent border-none cursor-pointer group/group"
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={isGroupOpen(group.label)}
                >
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-[#8a8f9d] tracking-[0.05em] group-hover/group:text-gray-700 dark:group-hover/group:text-[#b0b7c9] transition-colors">
                    {group.label}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 dark:text-[#8a8f9d] transition-transform duration-200 ${
                      isGroupOpen(group.label) ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>
              )}

              {/* Nav items */}
              <div
                className={`flex flex-col transition-all duration-200 overflow-hidden ${
                  isGroupOpen(group.label) || isCollapsed ? 'opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                } ${isCollapsed ? 'gap-1 items-center' : 'gap-1'}`}
              >
                {group.items.map(item => {
                  const isActive = location.pathname === item.path ||
                    (item.path === '/dashboard' && location.pathname === '/dashboard');

                  return isCollapsed ? (
                    /* Collapsed: icon-only with tooltip */
                    <div key={item.name} className="relative group/tooltip">
                      <button
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border-none cursor-pointer transition-all duration-200
                          ${isActive
                            ? 'bg-teal-50 dark:bg-[rgba(19,186,186,0.2)] text-teal-600 dark:text-[#62ffff] shadow-[inset_2px_0_0_rgba(98,255,255,0.8)]'
                            : 'bg-transparent text-gray-500 dark:text-[#8a8f9d] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        onClick={() => handleNavClick(item.path)}
                        aria-label={item.name}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.icon}
                      </button>
                      {/* Tooltip */}
                      <div
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-[#1e2433] text-white text-xs font-medium whitespace-nowrap
                          opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl
                          before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-gray-900 dark:before:border-r-[#1e2433]"
                        role="tooltip"
                      >
                        {item.name}
                      </div>
                    </div>
                  ) : (
                    /* Expanded: full nav item */
                    <button
                      key={item.name}
                      data-tour-id={
                        item.path === '/dashboard/shipments' ? 'tour-shipments-link' :
                        item.path === '/dashboard/settlements' ? 'tour-settlements-link' :
                        undefined
                      }
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-none w-full text-left relative
                        ${isActive
                          ? 'bg-teal-50 dark:bg-[rgba(19,186,186,0.15)] text-teal-700 dark:text-white border-l-[3px] border-l-teal-500 dark:border-l-[#62ffff] pl-[calc(0.75rem-3px)] [&_svg]:text-teal-500 dark:[&_svg]:text-[#62ffff]'
                          : 'bg-transparent text-gray-600 dark:text-[#8a8f9d] hover:bg-gray-100 dark:hover:bg-[rgba(19,186,186,0.08)] hover:text-gray-900 dark:hover:text-white'
                        }`}
                      onClick={() => handleNavClick(item.path)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider between groups when collapsed */}
              {isCollapsed && (
                <div className="w-8 h-px bg-gray-200 dark:bg-white/10 mx-auto mt-4" aria-hidden="true" />
              )}
            </div>
          ))}
        </nav>

        {/* Bottom status widget — hidden when collapsed */}
        {!isCollapsed && (
          <div className="mt-auto pt-6">
            <div className="bg-teal-50 dark:bg-[rgba(19,186,186,0.1)] border border-teal-200 dark:border-[rgba(98,255,255,0.3)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-100 dark:bg-[rgba(19,186,186,0.2)] rounded-[10px] flex items-center justify-center text-teal-600 dark:text-[#62ffff] shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-semibold mb-0.5 text-gray-800 dark:text-white truncate">Enterprise Node</h4>
                <p className="text-[11px] text-teal-600 dark:text-[#62ffff] flex items-center gap-1 m-0">
                  <span className="w-1.5 h-1.5 bg-teal-500 dark:bg-[#62ffff] rounded-full shadow-[0_0_8px_rgba(0,128,128,0.5)] dark:shadow-[0_0_8px_#62ffff] shrink-0" />
                  Syncing: Block 18.2M
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed: mini status dot */}
        {isCollapsed && (
          <div className="mt-auto flex justify-center pb-2" title="Enterprise Node — Syncing">
            <div className="relative group/tooltip">
              <div className="w-10 h-10 bg-teal-50 dark:bg-[rgba(19,186,186,0.15)] rounded-xl flex items-center justify-center text-teal-600 dark:text-[#62ffff]">
                <ShieldCheck size={18} />
              </div>
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 dark:bg-[#62ffff] rounded-full shadow-[0_0_6px_rgba(0,128,128,0.6)]" />
              {/* Tooltip */}
              <div
                className="absolute left-full ml-3 bottom-0 z-50 px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-[#1e2433] text-white text-xs font-medium whitespace-nowrap
                  opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-150 shadow-xl"
                role="tooltip"
              >
                Enterprise Node · Syncing
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <TopHeader toggleSidebar={toggleSidebar} />
        <main id="main-content" tabIndex={-1} className="p-8 lg:p-8 bg-gray-50 dark:bg-transparent outline-none">
          <AnimatedPage key={location.pathname}>
            <Outlet />
          </AnimatedPage>
        </main>
      </div>

      <SessionTimeoutModal />
    </div>
  );
};

export default DashboardLayout;
