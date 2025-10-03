import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthV2 } from '@/hooks/useAuthV2';
import { UserRole as AuthUserRole } from '@/hooks/useAuthV2';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types';
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
  const { isAuthenticated, isLoading, user, role } = useAuthV2();
  
  // Helper functions
  const hasRole = (checkRole: UserRole) => {
    if (!role) return false;
    // Map AuthUserRole to UserRole
    const roleMap: Record<AuthUserRole, UserRole> = {
      'customer': UserRole.STORE_EMPLOYEE,
      'rental_company': UserRole.STORE_ADMIN,
      'platform_admin': UserRole.GLOBAL_ADMIN,
    };
    return roleMap[role] === checkRole;
  };
  
  const hasPermission = (permission: Permission) => {
    if (!role) return false;
    const roleMap: Record<AuthUserRole, UserRole> = {
      'customer': UserRole.STORE_EMPLOYEE,
      'rental_company': UserRole.STORE_ADMIN,
      'platform_admin': UserRole.GLOBAL_ADMIN,
    };
    const mappedRole = roleMap[role];
    return ROLE_PERMISSIONS[mappedRole]?.includes(permission) || false;
  };
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