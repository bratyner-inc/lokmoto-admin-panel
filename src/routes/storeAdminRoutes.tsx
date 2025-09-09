import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole, PERMISSIONS } from '@/types';

// Lazy loading das páginas do Admin de Loja
const ClientesLoja = lazy(() => import('@/pages/store-admin/ClientesLoja'));
const Pagamentos = lazy(() => import('@/pages/store-admin/Pagamentos'));
const Contratos = lazy(() => import('@/pages/store-admin/Contratos'));
const ContratoForm = lazy(() => import('@/pages/store-admin/ContratoForm'));
const ContratoDetalhes = lazy(() => import('@/pages/store-admin/ContratoDetalhes'));
const Veiculos = lazy(() => import('@/pages/store-admin/Veiculos'));
const VeiculoDetalhes = lazy(() => import('@/pages/store-admin/VeiculoDetalhes'));
const VeiculoForm = lazy(() => import('@/pages/store-admin/VeiculoForm'));
const Manutencao = lazy(() => import('@/pages/store-admin/Manutencao'));
const ManutencaoForm = lazy(() => import('@/pages/store-admin/ManutencaoForm'));
const ManutencaoDetalhes = lazy(() => import('@/pages/store-admin/ManutencaoDetalhes'));
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
    path: '/contratos/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CONTRACTS}
      >
        <ContratoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CONTRACTS}
      >
        <ContratoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CONTRACTS}
      >
        <ContratoDetalhes />
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
    path: '/veiculos/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <VeiculoForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos/:id/editar',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <VeiculoForm mode="edit" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <Manutencao />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao/nova',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <ManutencaoForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <ManutencaoDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao/:id/editar',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_VEHICLES}
      >
        <ManutencaoForm mode="edit" />
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