import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import Signup from './pages/auth/Signup/Signup';
import Login from './pages/auth/Login/Login';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import CompanyDashboard from './pages/dashboard/Company/CompanyDashboard';
import Shipments from './pages/Shipments/Shipments';
import BlockchainLedger from './pages/BlockchainLedger/BlockchainLedger';
import Settlements from './pages/Settlements/Settlements';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';
import CompanySettings from './pages/dashboard/Company/Settings/CompanySettings';
import UserManagement from './pages/dashboard/Company/UserManagement/UserManagement';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <CompanyDashboard />,
          },
          {
            path: '/dashboard/shipments',
            element: <Shipments />,
          },
          {
            path: '/dashboard/blockchain-ledger',
            element: <BlockchainLedger />,
          },
          {
            path: '/dashboard/settlements',
            element: <Settlements />,
          },
          {
            path: '/dashboard/analytics',
            element: <Analytics />,
          },
          {
            path: '/dashboard/settings',
            element: <CompanySettings />,
          },
          {
            path: '/dashboard/team',
            element: <UserManagement />,
          },
          {
            path: '/dashboard/help-center',
            element: <HelpCenter />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
