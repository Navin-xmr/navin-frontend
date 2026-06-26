import React, { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import Signup from './pages/auth/Signup/Signup';
import Login from './pages/auth/Login/Login';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPassword/ResetPasswordPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import * as Sentry from '@sentry/react';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback/ErrorFallback';
import OfflineBanner from './components/common/OfflineBanner/OfflineBanner';
import PWAInstallPrompt from './components/ui/PWAInstallPrompt';
import PaginationDemo from './pages/ComponentDemos/PaginationDemo/PaginationDemo';
import PageSkeleton from './components/ui/PageSkeleton';
import { AuthProvider } from './context/AuthContext';
import { realtimeService } from './services/realtime/realtimeService';
import './App.css';

// Eagerly loaded (critical path)
import CompanyDashboard from './pages/dashboard/Company/CompanyDashboard';
import AnomalyAlertPanel from './pages/dashboard/Company/AnomalyPanel/AnomalyAlertPanel';
import Shipments from './pages/Shipments/Shipments';
import CreateShipment from './pages/dashboard/Company/CreateShipment/CreateShipment';
import CustomerProfile from './pages/dashboard/Customer/Profile/CustomerProfile';

// Lazy loaded
const ShipmentDetail = lazy(() => import('./pages/ShipmentDetail/ShipmentDetail'));
const BlockchainLedger = lazy(() => import('./pages/BlockchainLedger/BlockchainLedger'));
const Settlements = lazy(() => import('./pages/Settlements/Settlements'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const CompanySettings = lazy(() => import('./pages/dashboard/Company/Settings/CompanySettings'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const HelpCenter = lazy(() => import('./pages/HelpCenter/HelpCenter'));
const PaymentHistory = lazy(() => import('./pages/Payments/PaymentHistory/PaymentHistory'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));
const ShipmentHistory = lazy(() => import('./pages/dashboard/Customer/ShipmentHistory/ShipmentHistory'));
const UserManagement = lazy(() => import('./pages/dashboard/Company/UserManagement/UserManagement'));

const S = (element: React.ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
);

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/pagination-demo', element: <PaginationDemo /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Company-only routes
          {
            element: <RoleGuard allowedRoles={['company']} />,
            children: [
              { path: '/dashboard', element: <CompanyDashboard /> },
              { path: '/dashboard/anomalies', element: <AnomalyAlertPanel /> },
              { path: '/dashboard/blockchain-ledger', element: S(<BlockchainLedger />) },
              { path: '/dashboard/settlements', element: S(<Settlements />) },
              { path: '/dashboard/payments', element: S(<PaymentHistory />) },
              { path: '/dashboard/analytics', element: S(<Analytics />) },
              { path: '/dashboard/team', element: S(<UserManagement />) },
              { path: '/dashboard/shipments/create', element: <CreateShipment /> },
              { path: '/dashboard/company-settings', element: S(<CompanySettings />) },
            ],
          },
          // Shared routes (both roles)
          { path: '/dashboard/shipments', element: <Shipments /> },
          { path: '/dashboard/shipments/:id', element: S(<ShipmentDetail />) },
          { path: '/dashboard/shipments/history', element: S(<ShipmentHistory />) },
          { path: '/dashboard/settings', element: S(<Settings />) },
          { path: '/dashboard/help-center', element: S(<HelpCenter />) },
          { path: '/dashboard/notifications', element: S(<NotificationsPage />) },
          { path: '/dashboard/profile', element: <CustomerProfile /> },
        ],
      },
    ],
  },
]);

function RealtimeManager() {
  useEffect(() => {
    realtimeService.reset();
    realtimeService.connect();
    return () => realtimeService.disconnect();
  }, []);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Sentry.ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
        <ErrorBoundary>
          <OfflineBanner />
          <RealtimeManager />
          <RouterProvider router={router} />
          <PWAInstallPrompt />
        </ErrorBoundary>
      </Sentry.ErrorBoundary>
    </AuthProvider>
  );
}

export default App;