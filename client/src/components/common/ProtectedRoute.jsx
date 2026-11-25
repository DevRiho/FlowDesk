import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ProtectedRoute ensures that only authenticated users can access child routes.
// Unauthenticated visitors are redirected to /login with state preserving intended path.
export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-surface-600">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, verify user's role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If client tries to access internal dashboard, redirect to client portal
    if (user?.role === 'CLIENT') {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
