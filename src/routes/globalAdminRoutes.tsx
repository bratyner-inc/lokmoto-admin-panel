import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole, PERMISSIONS } from '@/types';

// Lazy loading das páginas do Admin Global
const Clientes = lazy(() => import('@/pages/global-admin/Clientes'));
const Usuarios = lazy(() => import('@/pages/global-admin/Usuarios'));
const UsuarioForm = lazy(() => import('@/pages/global-admin/UsuarioForm'));
const Financeiro = lazy(() => import('@/pages/global-admin/Financeiro'));
const Banners = lazy(() => import('@/pages/global-admin/Banners'));
const BannerForm = lazy(() => import('@/pages/global-admin/BannerForm'));

export const globalAdminRoutes: RouteObject[] = [
  {
    path: '/clientes',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
      >
        <Clientes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuarios',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_USERS}
      >
        <Usuarios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuarios/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_USERS}
      >
        <UsuarioForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuarios/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_USERS}
      >
        <UsuarioForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/financeiro',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_FINANCIAL}
      >
        <Financeiro />
      </ProtectedRoute>
    ),
  },
  {
    path: '/banners',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_BANNERS}
      >
        <Banners />
      </ProtectedRoute>
    ),
  },
  {
    path: '/banners/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_BANNERS}
      >
        <BannerForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/banners/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_BANNERS}
      >
        <BannerForm />
      </ProtectedRoute>
    ),
  },
];