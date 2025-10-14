import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, Permission } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission, user } = useAuth();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user is suspended (only for Store Admin)
  const isSuspendedPath = location.pathname === '/suspended';
  if (user.role === UserRole.STORE_ADMIN && user.isSuspended && !isSuspendedPath) {
    return <Navigate to="/suspended" replace />;
  }

  // Check if user needs to complete onboarding (only for Store Admin)
  const onboardingExemptPaths = ['/onboarding', '/suspended', '/logout'];
  const needsOnboarding =
    user.role === UserRole.STORE_ADMIN &&
    !user.onboardingCompleted &&
    !onboardingExemptPaths.includes(location.pathname);

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};