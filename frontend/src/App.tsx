import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import Signup from './pages/auth/Signup/Signup';
import Login from './pages/auth/Login/Login';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
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
    path: '/customer-dashboard',
    element: <CustomerDashboard />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
