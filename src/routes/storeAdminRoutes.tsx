import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy loading das páginas do Admin de Loja
const ClientesLoja = lazy(() => import('@/pages/store-admin/ClientesLoja'));
const ClienteLojaDetalhes = lazy(() => import('@/pages/store-admin/ClienteLojaDetalhes'));
const ClienteLojaForm = lazy(() => import('@/pages/store-admin/ClienteLojaForm'));
const Pagamentos = lazy(() => import('@/pages/store-admin/Pagamentos'));
const Contratos = lazy(() => import('@/pages/store-admin/Contratos'));
const ContratoForm = lazy(() => import('@/pages/store-admin/ContratoForm'));
const ContratoDetalhes = lazy(() => import('@/pages/store-admin/ContratoDetalhes'));
const Veiculos = lazy(() => import('@/pages/store-admin/Veiculos'));
const VeiculoDetalhes = lazy(() => import('@/pages/store-admin/VeiculoDetalhes'));
const VeiculoForm = lazy(() => import('@/pages/store-admin/VeiculoForm'));
const VeiculoEdicao = lazy(() => import('@/pages/store-admin/VeiculoEdicao'));
const Manutencao = lazy(() => import('@/pages/store-admin/Manutencao'));
const ManutencaoForm = lazy(() => import('@/pages/store-admin/ManutencaoForm'));
const ManutencaoDetalhes = lazy(() => import('@/pages/store-admin/ManutencaoDetalhes'));
const Propostas = lazy(() => import('@/pages/store-admin/Propostas'));
const Assinatura = lazy(() => import('@/pages/store-admin/Assinatura'));

export const storeAdminRoutes: RouteObject[] = [
  {
    path: '/clientes-loja',
    element: (
      <ProtectedRoute>
        <ClientesLoja />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes-loja/novo',
    element: (
      <ProtectedRoute>
        <ClienteLojaForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes-loja/:id',
    element: (
      <ProtectedRoute>
        <ClienteLojaDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes-loja/:id/editar',
    element: (
      <ProtectedRoute>
        <ClienteLojaForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pagamentos',
    element: (
      <ProtectedRoute>
        <Pagamentos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos',
    element: (
      <ProtectedRoute>
        <Contratos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos/novo',
    element: (
      <ProtectedRoute>
        <ContratoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos/editar/:id',
    element: (
      <ProtectedRoute>
        <ContratoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contratos/:id',
    element: (
      <ProtectedRoute>
        <ContratoDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos',
    element: (
      <ProtectedRoute>
        <Veiculos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos/:id',
    element: (
      <ProtectedRoute>
        <VeiculoDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos/novo',
    element: (
      <ProtectedRoute>
        <VeiculoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/veiculos/:id/editar',
    element: (
      <ProtectedRoute>
        <VeiculoEdicao />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao',
    element: (
      <ProtectedRoute>
        <Manutencao />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao/nova',
    element: (
      <ProtectedRoute>
        <ManutencaoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao/:id',
    element: (
      <ProtectedRoute>
        <ManutencaoDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manutencao/:id/editar',
    element: (
      <ProtectedRoute>
        <ManutencaoForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/propostas',
    element: (
      <ProtectedRoute>
        <Propostas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/assinatura',
    element: (
      <ProtectedRoute>
        <Assinatura />
      </ProtectedRoute>
    ),
  },
];
