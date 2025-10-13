import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole, PERMISSIONS } from '@/types';

// Lazy loading das páginas do Admin de Loja
const ClientesLoja = lazy(() => import('@/presentation/pages/store-admin/ClientesLoja'));
const ClienteLojaForm = lazy(() => import('@/presentation/pages/store-admin/ClienteLojaForm'));
const ClienteLojaDetalhes = lazy(() => import('@/presentation/pages/store-admin/ClienteLojaDetalhes'));
const Pagamentos = lazy(() => import('@/presentation/pages/store-admin/Pagamentos'));
const PagamentoForm = lazy(() => import('@/presentation/pages/store-admin/PagamentoForm'));
const PagamentoDetalhes = lazy(() => import('@/presentation/pages/store-admin/PagamentoDetalhes'));
const Contratos = lazy(() => import('@/presentation/pages/store-admin/Contratos'));
const ContratoForm = lazy(() => import('@/presentation/pages/store-admin/ContratoForm'));
const ContratoDetalhes = lazy(() => import('@/presentation/pages/store-admin/ContratoDetalhes'));
const Veiculos = lazy(() => import('@/presentation/pages/store-admin/Veiculos'));
const VeiculoDetalhes = lazy(() => import('@/presentation/pages/store-admin/VeiculoDetalhes'));
const VeiculoForm = lazy(() => import('@/presentation/pages/store-admin/VeiculoForm'));
const Manutencao = lazy(() => import('@/presentation/pages/store-admin/Manutencao'));
const ManutencaoForm = lazy(() => import('@/presentation/pages/store-admin/ManutencaoForm'));
const ManutencaoDetalhes = lazy(() => import('@/presentation/pages/store-admin/ManutencaoDetalhes'));
const Propostas = lazy(() => import('@/presentation/pages/store-admin/Propostas'));
const Tickets = lazy(() => import('@/presentation/pages/store-admin/Tickets'));
const TicketForm = lazy(() => import('@/presentation/pages/store-admin/TicketForm'));
const TicketDetalhes = lazy(() => import('@/presentation/pages/store-admin/TicketDetalhes'));
const Assinatura = lazy(() => import('@/presentation/pages/store-admin/Assinatura'));
const Configuracoes = lazy(() => import('@/presentation/pages/store-admin/Configuracoes'));

export const storeAdminRoutes: RouteObject[] = [
  {
    path: '/clientes-loja',
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
    path: '/clientes-loja/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
      >
        <ClienteLojaForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes-loja/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
      >
        <ClienteLojaForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes-loja/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_CLIENTS}
      >
        <ClienteLojaDetalhes />
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
    path: '/pagamentos/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_PAYMENTS}
      >
        <PagamentoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pagamentos/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_PAYMENTS}
      >
        <PagamentoDetalhes />
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
        <VeiculoForm />
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
        <VeiculoForm />
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
    path: '/tickets',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_CLIENTS}
      >
        <Tickets />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tickets/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_CLIENTS}
      >
        <TicketForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tickets/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_CLIENTS}
      >
        <TicketForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tickets/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_CLIENTS}
      >
        <TicketDetalhes />
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
  {
    path: '/configuracoes',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.STORE_ADMIN}
      >
        <Configuracoes />
      </ProtectedRoute>
    ),
  },
];