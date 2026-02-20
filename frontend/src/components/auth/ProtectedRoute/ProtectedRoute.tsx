import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import './ProtectedRoute.css';

const ProtectedRoute: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="protected-route-loading" role="status" aria-live="polite">
        <div className="protected-route-spinner" aria-hidden="true" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

