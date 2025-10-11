// Transaction domain entity
export type PaymentMethod = 'credit_card' | 'boleto' | 'pix';
export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TransactionType = 'rental_payment' | 'platform_subscription';

export interface Transaction {
  id: string;
  contractId?: string;
  rentalCompanyId: string;
  customerId?: string;
  
  // Transaction details
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  
  // Amounts
  amount: number;
  
  // Safe2Pay integration
  safe2payTransactionId?: string;
  safe2payPaymentUrl?: string;
  safe2payBarcode?: string;
  safe2payPixQrcode?: string;
  safe2payResponse?: Record<string, unknown>;
  
  // Dates
  dueDate: Date;
  paidAt?: Date;
  
  // Additional info
  description?: string;
  referenceMonth?: number; // 1-12
  referenceYear?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionDTO {
  contractId?: string;
  rentalCompanyId: string;
  customerId?: string;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  amount: number;
  dueDate: Date;
  description?: string;
  referenceMonth?: number;
  referenceYear?: number;
}

export interface UpdateTransactionDTO {
  status?: TransactionStatus;
  paidAt?: Date;
  safe2payTransactionId?: string;
  safe2payPaymentUrl?: string;
  safe2payBarcode?: string;
  safe2payPixQrcode?: string;
  safe2payResponse?: Record<string, unknown>;
  description?: string;
}

// Transaction with related data
export interface TransactionWithDetails extends Transaction {
  contract?: {
    id: string;
    contractNumber: string;
    status: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  rentalCompany?: {
    id: string;
    name: string;
    email: string;
  };
}

// Safe2Pay API Types
export interface Safe2PayPaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate: string; // ISO format
  description: string;
  reference?: string;
  customer: {
    name: string;
    email: string;
    identity: string; // CPF
  };
}

export interface Safe2PayPaymentResponse {
  success: boolean;
  transactionId: string;
  status: string;
  paymentUrl?: string;
  barcode?: string;
  pixQrCode?: string;
  message?: string;
  error?: string;
}

