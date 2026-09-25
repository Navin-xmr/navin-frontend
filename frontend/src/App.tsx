import React, { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import Signup from './pages/auth/Signup/Signup';
import Login from './pages/auth/Login/Login';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPassword/ResetPasswordPage';
import CompanyRegister from './pages/auth/Register/CompanyRegister';
import EmailVerification from './pages/auth/EmailVerification/EmailVerification';
import VerifyEmailPage from './pages/auth/VerifyEmail/VerifyEmailPage';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import * as Sentry from '@sentry/react';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback/ErrorFallback';
import OfflineBanner from './components/common/OfflineBanner/OfflineBanner';
import SlowConnectionBanner from './components/common/SlowConnectionBanner/SlowConnectionBanner';
import PWAInstallPrompt from './components/ui/PWAInstallPrompt';
import PageSkeleton from './components/ui/PageSkeleton';
import { AuthProvider } from './context/AuthContext';
import { RouteTransitionProvider } from './context/RouteTransitionContext';
import RouteTransition from './components/ui/RouteTransition';
import { realtimeService } from './services/realtime/realtimeService';
import PublicTrackingPage from './pages/PublicTracking/PublicTrackingPage';
import NotFoundPage from '@pages/NotFound/NotFoundPage';

// Lazy loaded
// Dev-only component demos (lazy-loaded; excluded from production bundle)
const PaginationDemo = import.meta.env.DEV
  ? lazy(() => import('./pages/ComponentDemos/PaginationDemo/PaginationDemo'))
  : lazy(() => Promise.resolve({ default: () => null }));
const ConfirmDialogDemo = import.meta.env.DEV
  ? lazy(() => import('./pages/ComponentDemos/ConfirmDialogDemo/ConfirmDialogDemo'))
  : lazy(() => Promise.resolve({ default: () => null }));
const SkeletonDemo = import.meta.env.DEV
  ? lazy(() => import('./pages/ComponentDemos/SkeletonDemo/SkeletonDemo'))
  : lazy(() => Promise.resolve({ default: () => null }));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const CompanyDashboard = lazy(() => import('./pages/dashboard/Company/CompanyDashboard'));
const CustomerDashboard = lazy(() => import('./pages/dashboard/Customer/CustomerDashboard'));
const AnomalyAlertPanel = lazy(() => import('./pages/dashboard/Company/AnomalyPanel/AnomalyAlertPanel'));
const Shipments = lazy(() => import('./pages/Shipments/Shipments'));
const CreateShipment = lazy(() => import('./pages/dashboard/Company/CreateShipment/CreateShipment'));
const ProfileDispatcher = lazy(() => import('./pages/dashboard/ProfileDispatcher/ProfileDispatcher'));
const ShipmentDetail = lazy(() => import('./pages/ShipmentDetail/ShipmentDetail'));
const BlockchainLedger = lazy(() => import('./pages/BlockchainLedger/BlockchainLedger'));
const Settlements = lazy(() => import('./pages/Settlements/Settlements'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const RevenueAnalytics = lazy(() => import('./pages/Analytics/RevenueAnalytics'));
const ExceptionDashboard = lazy(() => import('./pages/dashboard/ExceptionDashboard'));
const CompanySettings = lazy(() => import('./pages/dashboard/Company/Settings/CompanySettings'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const HelpCenter = lazy(() => import('./pages/HelpCenter/HelpCenter'));
const PaymentHistory = lazy(() => import('./pages/Payments/PaymentHistory/PaymentHistory'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));
const ShipmentHistory = lazy(() => import('./pages/dashboard/Customer/ShipmentHistory/ShipmentHistory'));
const UserManagement = lazy(() => import('./pages/dashboard/Company/UserManagement/UserManagement'));
const AcceptInvitation = lazy(() => import('./pages/auth/AcceptInvitation/AcceptInvitation'));
const CalendarView = lazy(() => import('./pages/dashboard/Company/CalendarView/CalendarView'));
const WhatsNewPage = lazy(() => import('./pages/WhatsNew/WhatsNewPage'));

const S = (element: React.ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
);

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/register/company', element: <CompanyRegister /> },
  { path: '/register/verify-email', element: <EmailVerification /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/accept-invitation', element: S(<AcceptInvitation />) },
  { path: '/pagination-demo', element: S(<PaginationDemo />) },
  { path: '/confirm-demo', element: S(<ConfirmDialogDemo />) },
  { path: '/skeleton-demo', element: S(<SkeletonDemo />) },
  { path: '/track/:trackingNumber', element: <PublicTrackingPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: S(<DashboardLayout />),
        children: [
          // Company-only routes
          {
            element: <RoleGuard allowedRoles={['company']} />,
            children: [
              { path: '/dashboard', element: S(<CompanyDashboard />) },
              { path: '/dashboard/anomalies', element: S(<AnomalyAlertPanel />) },
              { path: '/dashboard/blockchain-ledger', element: S(<BlockchainLedger />) },
              { path: '/dashboard/settlements', element: S(<Settlements />) },
              { path: '/dashboard/payments', element: S(<PaymentHistory />) },
              { path: '/dashboard/analytics', element: S(<Analytics />) },
              { path: '/dashboard/analytics/revenue', element: S(<RevenueAnalytics />) },
              { path: '/dashboard/analytics/exceptions', element: S(<ExceptionDashboard />) },
              { path: '/dashboard/team', element: S(<UserManagement />) },
              { path: '/dashboard/shipments/create', element: S(<CreateShipment />) },
              { path: '/dashboard/company-settings', element: S(<CompanySettings />) },
              { path: '/dashboard/calendar', element: S(<CalendarView />) },
            ],
          },
          // Customer-only routes
          {
            element: <RoleGuard allowedRoles={['customer']} />,
            children: [
              { path: '/dashboard/customer', element: S(<CustomerDashboard />) },
            ],
          },
          // Shared routes (both roles)
          { path: '/dashboard/shipments', element: S(<Shipments />) },
          { path: '/dashboard/shipments/:id', element: S(<ShipmentDetail />) },
          { path: '/dashboard/shipments/history', element: S(<ShipmentHistory />) },
          { path: '/dashboard/settings', element: S(<Settings />) },
          { path: '/dashboard/help-center', element: S(<HelpCenter />) },
          { path: '/dashboard/notifications', element: S(<NotificationsPage />) },
          { path: '/dashboard/profile', element: S(<ProfileDispatcher />) },
          { path: '/dashboard/*', element: <NotFoundPage /> },
          { path: '/dashboard/whats-new', element: S(<WhatsNewPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

function RealtimeManager() {
  useEffect(() => {
    // Disable realtime service in development if environment variable is set
    if (import.meta.env.VITE_DISABLE_REALTIME === 'true') {
      console.log('Realtime service disabled in development mode');
      return;
    }
    
    realtimeService.reset();
    realtimeService.connect();
    return () => realtimeService.disconnect();
  }, []);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <RouteTransitionProvider>
        <Sentry.ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
          <ErrorBoundary>
            <RouteTransition />
            <OfflineBanner />
            <SlowConnectionBanner />
            <RealtimeManager />
            <RouterProvider router={router} />
            <PWAInstallPrompt />
          </ErrorBoundary>
        </Sentry.ErrorBoundary>
      </RouteTransitionProvider>
    </AuthProvider>
  );
}

export default App;