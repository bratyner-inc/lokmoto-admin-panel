// Domain entity for Rental Company
export interface RentalCompany {
  id: string;
  tradingName: string; // Razão social
  companyName: string; // Nome fantasia
  email: string;
  phone: string;
  cnpj: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending' | 'canceled';
  subscriptionPlan?: string;
  subscriptionExpiration?: Date;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentalCompanyDTO {
  tradingName: string;
  companyName: string;
  email: string;
  phone: string;
  cnpj: string;
  subscriptionPlan?: string;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
}

export interface UpdateRentalCompanyDTO {
  tradingName?: string;
  companyName?: string;
  phone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'pending' | 'canceled';
  subscriptionExpiration?: Date;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
}

