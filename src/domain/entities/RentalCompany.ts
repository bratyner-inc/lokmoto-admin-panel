export interface RentalCompany {
  id: string;
  tradingName: string; // razão social
  companyName: string; // nome fantasia
  email: string;
  phone: string;
  cnpj: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending' | 'canceled';
  subscriptionPlan?: string;
  subscriptionExpiration?: Date;
  safe2paySubscriptionId?: string;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
