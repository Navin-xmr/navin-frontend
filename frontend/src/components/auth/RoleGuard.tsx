import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@context/AuthContext';
import type { UserRole } from '@utils/rbac';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  company: '/dashboard',
  customer: '/dashboard',
};

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { isLoading, isAuthenticated, role } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center gap-3 text-slate-900 bg-slate-50 font-medium"
        role="status"
        aria-live="polite"
      >
        <div
          className="w-4.5 h-4.5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span>Checking permissions…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && !allowedRoles.includes(role)) {
    const redirect = ROLE_DASHBOARDS[role] ?? '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;
