import { Transaction, TransactionWithDetails } from '@/domain/entities/Transaction';

// Database representation of a transaction
export interface TransactionDB {
  id: string;
  contract_id: string | null;
  rental_company_id: string;
  customer_id: string | null;
  transaction_type: string;
  payment_method: string;
  status: string;
  amount: string; // Decimal stored as string
  safe2pay_transaction_id: string | null;
  safe2pay_payment_url: string | null;
  safe2pay_barcode: string | null;
  safe2pay_pix_qrcode: string | null;
  safe2pay_response: Record<string, unknown> | null;
  due_date: string;
  paid_at: string | null;
  description: string | null;
  reference_month: number | null;
  reference_year: number | null;
  created_at: string;
  updated_at: string;
}

// Transaction with joined details
export interface TransactionWithDetailsDB extends TransactionDB {
  contracts?: {
    id: string;
    contract_number: string;
    status: string;
  };
  customers?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  rental_companies?: {
    id: string;
    company_name: string;
    email: string;
  };
}

export class TransactionMapper {
  /**
   * Map from database representation to domain entity
   */
  static toDomain(raw: TransactionDB): Transaction {
    return {
      id: raw.id,
      contractId: raw.contract_id || undefined,
      rentalCompanyId: raw.rental_company_id,
      customerId: raw.customer_id || undefined,
      transactionType: raw.transaction_type as 'rental_payment' | 'platform_subscription',
      paymentMethod: raw.payment_method as 'credit_card' | 'boleto' | 'pix',
      status: raw.status as 'pending' | 'paid' | 'failed' | 'refunded',
      amount: parseFloat(raw.amount),
      safe2payTransactionId: raw.safe2pay_transaction_id || undefined,
      safe2payPaymentUrl: raw.safe2pay_payment_url || undefined,
      safe2payBarcode: raw.safe2pay_barcode || undefined,
      safe2payPixQrcode: raw.safe2pay_pix_qrcode || undefined,
      safe2payResponse: raw.safe2pay_response || undefined,
      dueDate: new Date(raw.due_date),
      paidAt: raw.paid_at ? new Date(raw.paid_at) : undefined,
      description: raw.description || undefined,
      referenceMonth: raw.reference_month || undefined,
      referenceYear: raw.reference_year || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Map transaction with details from database to domain
   */
  static toDomainWithDetails(raw: TransactionWithDetailsDB): TransactionWithDetails {
    const transaction = this.toDomain(raw);
    
    return {
      ...transaction,
      contract: raw.contracts ? {
        id: raw.contracts.id,
        contractNumber: raw.contracts.contract_number,
        status: raw.contracts.status,
      } : undefined,
      customer: raw.customers ? {
        id: raw.customers.id,
        name: raw.customers.full_name,
        email: raw.customers.email,
        phone: raw.customers.phone,
      } : undefined,
      rentalCompany: raw.rental_companies ? {
        id: raw.rental_companies.id,
        name: raw.rental_companies.company_name,
        email: raw.rental_companies.email,
      } : undefined,
    };
  }

  /**
   * Map an array of database records to domain entities
   */
  static toDomainArray(rawArray: TransactionDB[]): Transaction[] {
    return rawArray.map(raw => this.toDomain(raw));
  }

  /**
   * Map an array of detailed transactions
   */
  static toDomainWithDetailsArray(rawArray: TransactionWithDetailsDB[]): TransactionWithDetails[] {
    return rawArray.map(raw => this.toDomainWithDetails(raw));
  }
}

