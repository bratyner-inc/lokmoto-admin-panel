import { RentalCompany } from '@/domain/entities/RentalCompany';

interface RentalCompanyDB {
  id: string;
  trading_name: string;
  company_name: string;
  email: string;
  phone: string;
  cnpj: string;
  subscription_status: 'active' | 'inactive' | 'pending' | 'canceled';
  subscription_plan?: string;
  subscription_expiration?: string;
  safe2pay_subscription_id?: string;
  bank_account?: any;
  created_at: string;
  updated_at: string;
}

export class RentalCompanyMapper {
  static toDomain(raw: RentalCompanyDB): RentalCompany {
    return {
      id: raw.id,
      tradingName: raw.trading_name,
      companyName: raw.company_name,
      email: raw.email,
      phone: raw.phone,
      cnpj: raw.cnpj,
      subscriptionStatus: raw.subscription_status,
      subscriptionPlan: raw.subscription_plan,
      subscriptionExpiration: raw.subscription_expiration ? new Date(raw.subscription_expiration) : undefined,
      safe2paySubscriptionId: raw.safe2pay_subscription_id,
      bankAccount: raw.bank_account,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  static toDatabase(domain: Partial<RentalCompany>): Partial<RentalCompanyDB> {
    return {
      ...(domain.id && { id: domain.id }),
      ...(domain.tradingName && { trading_name: domain.tradingName }),
      ...(domain.companyName && { company_name: domain.companyName }),
      ...(domain.email && { email: domain.email }),
      ...(domain.phone && { phone: domain.phone }),
      ...(domain.cnpj && { cnpj: domain.cnpj }),
      ...(domain.subscriptionStatus && { subscription_status: domain.subscriptionStatus }),
      ...(domain.subscriptionPlan && { subscription_plan: domain.subscriptionPlan }),
      ...(domain.subscriptionExpiration && { subscription_expiration: domain.subscriptionExpiration.toISOString() }),
      ...(domain.safe2paySubscriptionId && { safe2pay_subscription_id: domain.safe2paySubscriptionId }),
      ...(domain.bankAccount && { bank_account: domain.bankAccount }),
    };
  }
}
