import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

const ProtectedRoute: React.FC = () => {
    const { isLoading, isAuthenticated } = useAuth();
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
