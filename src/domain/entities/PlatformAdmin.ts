// Domain entity for Platform Admin
export type PlatformAdminRole = 'super_admin' | 'manager' | 'support';

export interface PlatformAdmin {
  id: string;
  fullName: string;
  email: string;
  role: PlatformAdminRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlatformAdminDTO {
  fullName: string;
  email: string;
  role: PlatformAdminRole;
}

export interface UpdatePlatformAdminDTO {
  fullName?: string;
  role?: PlatformAdminRole;
}

