export type PaymentMethod = 'credit_card' | 'boleto' | 'pix';
export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TransactionType = 'rental_payment' | 'platform_subscription';

export interface Transaction {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  externalReference?: string;
  safe2paySubscriptionId?: string;
  contractId?: string;
  transactionType: TransactionType;
  customerData?: {
    cpfCnpj: string;
    id: string;
    name: string;
    rentalCompanyCnpj?: string;
    rentalCompanyName?: string;
  };
  rentalCompanyData?: {
    cnpj: string;
    id: string;
    tradingName: string;
    subscriptionPlan?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
