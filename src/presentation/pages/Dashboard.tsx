/**
 * Dashboard Router Component
 * Decides which dashboard to show based on user role
 */

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { PageLoader } from '@/components/ui/page-loader';

// Lazy imports
import { lazy, Suspense } from 'react';

const GlobalAdminDashboard = lazy(() => import('./global-admin/Dashboard'));
const StoreAdminDashboard = lazy(() => import('./store-admin/Dashboard'));

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  // Render dashboard based on user role
  if (user?.role === UserRole.GLOBAL_ADMIN) {
    return (
      <Suspense fallback={<PageLoader />}>
        <GlobalAdminDashboard />
      </Suspense>
    );
  }

  if (user?.role === UserRole.STORE_ADMIN) {
    return (
      <Suspense fallback={<PageLoader />}>
        <StoreAdminDashboard />
      </Suspense>
    );
  }

  // Fallback (should not reach here if auth is working)
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sem permissão
        </h2>
        <p className="text-gray-600">
          Você não tem permissão para acessar este dashboard.
        </p>
      </div>
    </div>
  );
}

