export enum UserRole {
  GLOBAL_ADMIN = 'global_admin',
  STORE_ADMIN = 'store_admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string; // Para admins de loja específica
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// RBAC Permissions
export const PERMISSIONS = {
  // Global Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_FINANCIAL: 'manage_financial',
  MANAGE_BANNERS: 'manage_banners',
  
  // Store Admin permissions
  VIEW_CLIENTS: 'view_clients',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_CONTRACTS: 'manage_contracts',
  MANAGE_VEHICLES: 'manage_vehicles',
  MANAGE_PROPOSALS: 'manage_proposals',
  MANAGE_SUBSCRIPTION: 'manage_subscription'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GLOBAL_ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_FINANCIAL,
    PERMISSIONS.MANAGE_BANNERS
  ],
  [UserRole.STORE_ADMIN]: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_CONTRACTS,
    PERMISSIONS.MANAGE_VEHICLES,
    PERMISSIONS.MANAGE_PROPOSALS,
    PERMISSIONS.MANAGE_SUBSCRIPTION
  ]
};