import { UserRole } from '@/types';

// User domain entity (unified representation of platform_admins and rental_companies)
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole; // GLOBAL_ADMIN or STORE_ADMIN
  rentalCompanyId?: string; // Only for STORE_ADMIN
  rentalCompanyName?: string; // For display purposes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole; // GLOBAL_ADMIN or STORE_ADMIN
  // For STORE_ADMIN, these are required:
  tradingName?: string; // Razão social (if creating new rental company)
  companyName?: string; // Nome fantasia (if creating new rental company)
  cnpj?: string; // CNPJ (if creating new rental company)
}

export interface UpdateUserDTO {
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}


