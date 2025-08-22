import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole, PERMISSIONS } from '@/types';

// Lazy loading das páginas do Admin de Loja
const ClientesLoja = lazy(() => import('@/pages/store-admin/ClientesLoja'));
const Pagamentos = lazy(() => import('@/pages/store-admin/Pagamentos'));
const Contratos = lazy(() => import('@/pages/store-admin/Contratos'));
const Veiculos = lazy(() => import('@/pages/store-admin/Veiculos'));
const VeiculoDetalhes = lazy(() => import('@/pages/store-admin/VeiculoDetalhes'));
const Propostas = lazy(() => import('@/pages/store-admin/Propostas'));
const Assinatura = lazy(() => import('@/pages/store-admin/Assinatura'));

export const storeAdminRoutes: RouteObject[] = [
  {
    path: '/clientes',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_CLIENTS}
      >
        <ClientesLoja />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pagamentos',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_PAYMENTS}
      >
        <Pagamentos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CONTRACTS}
      >
        <Contratos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <Veiculos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <VeiculoDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/propostas',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_PROPOSALS}
      >
        <Propostas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/assinatura',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_SUBSCRIPTION}
      >
        <Assinatura />
      </ProtectedRoute>
    ),
  },
];