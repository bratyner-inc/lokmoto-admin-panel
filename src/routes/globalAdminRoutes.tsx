import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole, PERMISSIONS } from '@/types';

// Lazy loading das páginas do Admin Global
// Nota: Dashboard é tratado centralmente no App.tsx
const Locadoras = lazy(() => import('@/presentation/pages/global-admin/Locadoras'));
const LocadoraForm = lazy(() => import('@/presentation/pages/global-admin/LocadoraForm'));
const LocadoraDetalhes = lazy(() => import('@/presentation/pages/global-admin/LocadoraDetalhes'));
const PlanosSafe2Pay = lazy(() => import('@/presentation/pages/global-admin/PlanosSafe2Pay'));
const Financeiro = lazy(() => import('@/presentation/pages/global-admin/Financeiro'));
const Clientes = lazy(() => import('@/presentation/pages/global-admin/Clientes'));
const ClienteForm = lazy(() => import('@/pages/global-admin/ClienteForm'));
const ClienteDetalhes = lazy(() => import('@/pages/global-admin/ClienteDetalhes'));
const Usuarios = lazy(() => import('@/presentation/pages/global-admin/Usuarios'));
const UsuarioForm = lazy(() => import('@/presentation/pages/global-admin/UsuarioForm'));
const Banners = lazy(() => import('@/presentation/pages/global-admin/Banners'));
const BannerForm = lazy(() => import('@/presentation/pages/global-admin/BannerForm'));

export const globalAdminRoutes: RouteObject[] = [
  // Nota: /dashboard é tratado centralmente no App.tsx e redireciona baseado no role
  
  // Locadoras (Rental Companies)
  {
    path: '/locadoras',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
      >
        <Locadoras />
      </ProtectedRoute>
    ),
  },
  {
    path: '/locadoras/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
      >
        <LocadoraForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/locadoras/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
      >
        <LocadoraForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/locadoras/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
      >
        <LocadoraDetalhes />
      </ProtectedRoute>
    ),
  },
  // Planos Safe2Pay
  {
    path: '/planos-safe2pay',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
      >
        <PlanosSafe2Pay />
      </ProtectedRoute>
    ),
  },
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
    path: '/clientes/novo',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
      >
        <ClienteForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes/editar/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
      >
        <ClienteForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes/:id',
    element: (
      <ProtectedRoute 
        requiredRole={UserRole.GLOBAL_ADMIN}
        requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
      >
        <ClienteDetalhes />
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