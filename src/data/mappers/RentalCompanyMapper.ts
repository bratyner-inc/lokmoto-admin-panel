import { RentalCompany, CreateRentalCompanyDTO, UpdateRentalCompanyDTO } from '@/domain/entities/RentalCompany';

// Database representation
export interface RentalCompanyDB {
  id: string;
  trading_name: string;
  company_name: string;
  email: string;
  phone: string;
  cnpj: string;
  subscription_status: 'active' | 'inactive' | 'pending' | 'canceled';
  subscription_plan: string | null;
  subscription_expiration: string | null;
  bank_account: any;
  created_at: string;
  updated_at: string;
}

export class RentalCompanyMapper {
  static toDomain(db: RentalCompanyDB): RentalCompany {
    return {
      id: db.id,
      tradingName: db.trading_name,
      companyName: db.company_name,
      email: db.email,
      phone: db.phone,
      cnpj: db.cnpj,
      subscriptionStatus: db.subscription_status,
      subscriptionPlan: db.subscription_plan || undefined,
      subscriptionExpiration: db.subscription_expiration ? new Date(db.subscription_expiration) : undefined,
      bankAccount: db.bank_account || undefined,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  static toCreateDB(dto: CreateRentalCompanyDTO): Omit<RentalCompanyDB, 'id' | 'created_at' | 'updated_at' | 'subscription_status' | 'subscription_expiration'> {
    return {
      trading_name: dto.tradingName,
      company_name: dto.companyName,
      email: dto.email,
      phone: dto.phone,
      cnpj: dto.cnpj,
      subscription_plan: dto.subscriptionPlan || null,
      bank_account: dto.bankAccount || null,
    };
  }

  static toUpdateDB(dto: UpdateRentalCompanyDTO): Partial<RentalCompanyDB> {
    const update: Partial<RentalCompanyDB> = {};
    
    if (dto.tradingName !== undefined) update.trading_name = dto.tradingName;
    if (dto.companyName !== undefined) update.company_name = dto.companyName;
    if (dto.phone !== undefined) update.phone = dto.phone;
    if (dto.subscriptionPlan !== undefined) update.subscription_plan = dto.subscriptionPlan;
    if (dto.subscriptionStatus !== undefined) update.subscription_status = dto.subscriptionStatus;
    if (dto.subscriptionExpiration !== undefined) {
      update.subscription_expiration = dto.subscriptionExpiration.toISOString();
    }
    if (dto.bankAccount !== undefined) update.bank_account = dto.bankAccount;
    
    return update;
  }
}

