import { User } from '@/domain/entities/User';
import { UserRole } from '@/types';
import { PlatformAdminDB } from './RentalCompanyMapper';
import { RentalCompanyDB } from './RentalCompanyMapper';

export class UserMapper {
  /**
   * Map platform_admin from database to User domain entity
   */
  static platformAdminToDomain(db: PlatformAdminDB): User {
    return {
      id: db.id,
      fullName: db.full_name,
      email: db.email,
      phone: undefined,
      role: UserRole.GLOBAL_ADMIN,
      isActive: true,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  /**
   * Map rental_company from database to User domain entity
   */
  static rentalCompanyToDomain(db: RentalCompanyDB): User {
    return {
      id: db.id,
      fullName: db.company_name,
      email: db.email,
      phone: db.phone,
      role: UserRole.STORE_ADMIN,
      rentalCompanyId: db.id,
      rentalCompanyName: db.company_name,
      isActive: db.subscription_status === 'active',
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }
}

// Platform Admin DB representation (minimal)
export interface PlatformAdminDB {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}


