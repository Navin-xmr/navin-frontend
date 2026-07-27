import React, { useEffect, useRef, useState } from 'react';
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
  Star,
} from 'lucide-react';
import TopHeader from './TopHeader/TopHeader';
import AnimatedPage from './AnimatedPage';
import { SessionTimeoutModal } from '../auth/SessionTimeoutModal';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const FAVORITES_STORAGE_KEY = 'navin_dashboard_favorites';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favoritePaths, setFavoritePaths] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as unknown) : [];
      return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
    } catch {
      return [];
    }
  });
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const mainMenu: NavItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Shipments', icon: <Package size={18} />, path: '/dashboard/shipments' },
    { name: 'Shipment History', icon: <History size={18} />, path: '/dashboard/shipments/history' },
    { name: 'Blockchain Ledger', icon: <Database size={18} />, path: '/dashboard/blockchain-ledger' },
    { name: 'Settlements', icon: <Wallet size={18} />, path: '/dashboard/settlements' },
    { name: 'Payments', icon: <CreditCard size={18} />, path: '/dashboard/payments' },
    { name: 'Analytics', icon: <BarChart3 size={18} />, path: '/dashboard/analytics' },
    { name: 'Notifications', icon: <Bell size={18} />, path: '/dashboard/notifications' },
  ];

  const systemMenu: NavItem[] = [
    { name: 'Profile', icon: <User size={18} />, path: '/dashboard/profile' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/dashboard/settings' },
    { name: 'Help Center', icon: <HelpCircle size={18} />, path: '/dashboard/help-center' },
  ];

  const allMenuItems = [...mainMenu, ...systemMenu];
  const favoriteItems = favoritePaths
    .map((path) => allMenuItems.find((item) => item.path === path))
    .filter((item): item is NavItem => Boolean(item));

  const toggleFavorite = (path: string) => {
    setFavoritePaths((current) => {
      const next = current.includes(path)
        ? current.filter((itemPath) => itemPath !== path)
        : [...current, path];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Keep the in-memory preference if persistence is unavailable.
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    if (!isSidebarOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    }
    setIsSidebarOpen((prev) => !prev);
  };
  const closeSidebar = () => setIsSidebarOpen(false);

  const renderNavItem = (item: NavItem, allowFavorite = true) => {
    const isActive = location.pathname === item.path;
    const isFavorite = favoritePaths.includes(item.path);

    return (
      <div key={item.path} className="group flex items-center gap-1">
        <button
          data-tour-id={
            item.path === '/dashboard/shipments' ? 'tour-shipments-link' :
            item.path === '/dashboard/settlements' ? 'tour-settlements-link' :
            undefined
          }
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg border-none px-3 py-2.5 text-left text-sm font-medium transition-all cursor-pointer
            ${isActive
              ? 'bg-teal-50 dark:bg-[rgba(19,186,186,0.15)] text-teal-700 dark:text-white border-l-[3px] border-l-teal-500 dark:border-l-[#62ffff] pl-2.25 [&_svg]:text-teal-500 dark:[&_svg]:text-[#62ffff]'
              : 'bg-transparent text-gray-600 dark:text-[#8a8f9d] hover:bg-gray-100 dark:hover:bg-[rgba(19,186,186,0.1)] hover:text-gray-900 dark:hover:text-white'
            }`}
          onClick={() => { navigate(item.path); closeSidebar(); }}
        >
          {item.icon}
          <span className="truncate">{item.name}</span>
        </button>
        {allowFavorite && (
          <button
            type="button"
            onClick={() => toggleFavorite(item.path)}
            className={`rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-[#62ffff] ${
              isFavorite
                ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-300/10'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-[#8a8f9d] dark:hover:bg-[rgba(19,186,186,0.1)] dark:hover:text-white'
            }`}
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? 'Remove' : 'Add'} ${item.name} ${isFavorite ? 'from' : 'to'} dashboard favorites`}
            title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          >
            <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!isSidebarOpen) return;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
        return;
      }
      if (e.key !== 'Tab' || !sidebarRef.current) return;
      const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedElement.current?.focus();
    };
  }, [isSidebarOpen]);

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
        ref={sidebarRef}
        role={isSidebarOpen ? 'dialog' : undefined}
        aria-modal={isSidebarOpen || undefined}
        aria-label="Main navigation"
        className={`
          w-65 bg-white dark:bg-[#0b0e14] border-r border-gray-200 dark:border-[#1e2433] flex flex-col shrink-0 p-6
          lg:relative lg:translate-x-0
          fixed top-0 left-0 h-full z-100 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 text-xl font-bold mb-12 text-teal-600 dark:text-[#62ffff]">
          <img src="/images/logo.svg" alt="Navin Logo" className="w-8 h-8" />
          <span>NAVIN</span>
          <button
            ref={closeButtonRef}
            className="ml-auto flex lg:hidden bg-transparent border-none text-slate-400 cursor-pointer"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {favoriteItems.length > 0 && (
          <div className="mb-8" aria-label="Dashboard favorites">
            <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-[#8a8f9d] tracking-[0.05em] mb-4">Favorites</h3>
            <div className="flex flex-col gap-1">
              {favoriteItems.map((item) => renderNavItem(item, false))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-[#8a8f9d] tracking-[0.05em] mb-4">Main Menu</h3>
          <div className="flex flex-col gap-1">
            {mainMenu.map((item) => renderNavItem(item))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-[#8a8f9d] tracking-[0.05em] mb-4">System</h3>
          <div className="flex flex-col gap-1">
            {systemMenu.map((item) => renderNavItem(item))}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="bg-teal-50 dark:bg-[rgba(19,186,186,0.1)] border border-teal-200 dark:border-[rgba(98,255,255,0.3)] rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-100 dark:bg-[rgba(19,186,186,0.2)] rounded-[10px] flex items-center justify-center text-teal-600 dark:text-[#62ffff]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-0.5 text-gray-800 dark:text-white">Enterprise Node</h4>
              <p className="text-[11px] text-teal-600 dark:text-[#62ffff] flex items-center gap-1 m-0">
                <span className="w-1.5 h-1.5 bg-teal-500 dark:bg-[#62ffff] rounded-full shadow-[0_0_8px_rgba(0,128,128,0.5)] dark:shadow-[0_0_8px_#62ffff]" />
                Syncing: Block 18.2M
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
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
