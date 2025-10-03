import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy loading das páginas do Admin Global
const Clientes = lazy(() => import('@/pages/global-admin/Clientes'));
const ClienteForm = lazy(() => import('@/pages/global-admin/ClienteForm'));
const ClienteDetalhes = lazy(() => import('@/pages/global-admin/ClienteDetalhes'));
const Usuarios = lazy(() => import('@/pages/global-admin/Usuarios'));
const UsuarioForm = lazy(() => import('@/pages/global-admin/UsuarioForm'));
const Financeiro = lazy(() => import('@/pages/global-admin/Financeiro'));
const Banners = lazy(() => import('@/pages/global-admin/Banners'));
const BannerForm = lazy(() => import('@/pages/global-admin/BannerForm'));

export const globalAdminRoutes: RouteObject[] = [
  {
    path: '/admin/clientes',
    element: (
      <ProtectedRoute>
        <Clientes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/clientes/novo',
    element: (
      <ProtectedRoute>
        <ClienteForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/clientes/:id/editar',
    element: (
      <ProtectedRoute>
        <ClienteForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/clientes/:id',
    element: (
      <ProtectedRoute>
        <ClienteDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios',
    element: (
      <ProtectedRoute>
        <Usuarios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios/novo',
    element: (
      <ProtectedRoute>
        <UsuarioForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios/:id/editar',
    element: (
      <ProtectedRoute>
        <UsuarioForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/financeiro',
    element: (
      <ProtectedRoute>
        <Financeiro />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/banners',
    element: (
      <ProtectedRoute>
        <Banners />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/banners/novo',
    element: (
      <ProtectedRoute>
        <BannerForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/banners/:id/editar',
    element: (
      <ProtectedRoute>
        <BannerForm />
      </ProtectedRoute>
    ),
  },
];