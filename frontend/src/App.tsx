import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import Signup from './pages/auth/Signup/Signup';
import Login from './pages/auth/Login/Login';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import CompanyDashboard from './pages/dashboard/Company/CompanyDashboard';
import Shipments from './pages/Shipments/Shipments';
import ShipmentDetail from './pages/ShipmentDetail/ShipmentDetail';
import BlockchainLedger from './pages/BlockchainLedger/BlockchainLedger';
import Settlements from './pages/Settlements/Settlements';
import Analytics from './pages/Analytics/Analytics';
import UserManagement from './pages/dashboard/Company/UserManagement/UserManagement';
import CompanySettings from './pages/dashboard/Company/Settings/CompanySettings';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import CreateShipment from './pages/dashboard/Company/CreateShipment/CreateShipment';
import PaymentHistory from './pages/Payments/PaymentHistory/PaymentHistory';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import CustomerProfile from './pages/dashboard/Customer/Profile/CustomerProfile';
import ShipmentHistory from './pages/dashboard/Customer/ShipmentHistory/ShipmentHistory';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import PaginationDemo from './pages/ComponentDemos/PaginationDemo/PaginationDemo';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/pagination-demo",
    element: <PaginationDemo />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <CompanyDashboard />,
          },
          {
            path: "/dashboard/shipments",
            element: <Shipments />,
          },
          {
            path: '/dashboard/shipments/:id',
            element: <ShipmentDetail />,
          },
          {
            path: '/dashboard/shipments/create',
            element: <CreateShipment />,
          },
          {
            path: "/dashboard/shipments/history",
            element: <ShipmentHistory />,
          },
          {
            path: "/dashboard/shipments/:id",
            element: <ShipmentDetail />,
          },
          {
            path: "/dashboard/blockchain-ledger",
            element: <BlockchainLedger />,
          },
          {
            path: "/dashboard/settlements",
            element: <Settlements />,
          },
          {
            path: "/dashboard/payments",
            element: <PaymentHistory />,
          },
          {
            path: "/dashboard/analytics",
            element: <Analytics />,
          },
          {
            path: "/dashboard/settings",
            element: <CompanySettings />,
          },
          {
            path: "/dashboard/team",
            element: <UserManagement />,
          },
          {
            path: "/dashboard/help-center",
            element: <HelpCenter />,
          },
          {
            path: "/dashboard/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "/dashboard/profile",
            element: <CustomerProfile />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
