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
    path: '/clientes',
    element: (
      <ProtectedRoute>
        <Clientes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes/novo',
    element: (
      <ProtectedRoute>
        <ClienteForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes/editar/:id',
    element: (
      <ProtectedRoute>
        <ClienteForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes/:id',
    element: (
      <ProtectedRoute>
        <ClienteDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuarios',
    element: (
      <ProtectedRoute>
        <Usuarios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuarios/novo',
    element: (
      <ProtectedRoute>
        <UsuarioForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuarios/editar/:id',
    element: (
      <ProtectedRoute>
        <UsuarioForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/financeiro',
    element: (
      <ProtectedRoute>
        <Financeiro />
      </ProtectedRoute>
    ),
  },
  {
    path: '/banners',
    element: (
      <ProtectedRoute>
        <Banners />
      </ProtectedRoute>
    ),
  },
  {
    path: '/banners/novo',
    element: (
      <ProtectedRoute>
        <BannerForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/banners/editar/:id',
    element: (
      <ProtectedRoute>
        <BannerForm />
      </ProtectedRoute>
    ),
  },
];