import { supabase } from '@/infrastructure/config/supabase';
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { 
  Transaction, 
  TransactionWithDetails,
  CreateTransactionDTO, 
  UpdateTransactionDTO,
  TransactionStatus
} from '@/domain/entities/Transaction';
import { TransactionMapper, TransactionDB, TransactionWithDetailsDB } from '../mappers/TransactionMapper';

export class TransactionRepository implements ITransactionRepository {
  private readonly tableName = 'transactions';

  /**
   * Get all transactions for the authenticated rental company
   */
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return TransactionMapper.toDomainArray(data as TransactionDB[]);
  }

  /**
   * Get a single transaction by ID
   */
  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return TransactionMapper.toDomain(data as TransactionDB);
  }

  /**
   * Get a transaction with full details
   */
  async getByIdWithDetails(id: string): Promise<TransactionWithDetails | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        contracts!transactions_contract_id_fkey(id, contract_number, status),
        customers(id, full_name, email, phone),
        rental_companies(id, company_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch transaction with details: ${error.message}`);
    }

    return TransactionMapper.toDomainWithDetails(data as TransactionWithDetailsDB);
  }

  /**
   * Create a new transaction
   */
  async create(data: CreateTransactionDTO, rentalCompanyAuthId: string): Promise<Transaction> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert({
        contract_id: data.contractId || null,
        rental_company_id: rentalCompanyAuthId,
        customer_id: data.customerId || null,
        transaction_type: data.transactionType,
        payment_method: data.paymentMethod,
        status: 'pending',
        amount: data.amount,
        due_date: data.dueDate.toISOString().split('T')[0],
        description: data.description || null,
        reference_month: data.referenceMonth || null,
        reference_year: data.referenceYear || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return TransactionMapper.toDomain(result as TransactionDB);
  }

  /**
   * Update an existing transaction
   */
  async update(id: string, data: UpdateTransactionDTO): Promise<Transaction> {
    const updateData: Partial<Record<string, unknown>> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.paidAt !== undefined) updateData.paid_at = data.paidAt?.toISOString();
    if (data.safe2payTransactionId !== undefined) updateData.safe2pay_transaction_id = data.safe2payTransactionId;
    if (data.safe2payPaymentUrl !== undefined) updateData.safe2pay_payment_url = data.safe2payPaymentUrl;
    if (data.safe2payBarcode !== undefined) updateData.safe2pay_barcode = data.safe2payBarcode;
    if (data.safe2payPixQrcode !== undefined) updateData.safe2pay_pix_qrcode = data.safe2payPixQrcode;
    if (data.safe2payResponse !== undefined) updateData.safe2pay_response = data.safe2payResponse;
    if (data.description !== undefined) updateData.description = data.description;

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return TransactionMapper.toDomain(result as TransactionDB);
  }

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  /**
   * Get transactions by contract ID
   */
  async getByContractId(contractId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('contract_id', contractId)
      .order('due_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions by contract: ${error.message}`);
    }

    return TransactionMapper.toDomainArray(data as TransactionDB[]);
  }

  /**
   * Get transactions by customer ID
   */
  async getByCustomerId(customerId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('customer_id', customerId)
      .order('due_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions by customer: ${error.message}`);
    }

    return TransactionMapper.toDomainArray(data as TransactionDB[]);
  }

  /**
   * Get transactions by status
   */
  async getByStatus(status: TransactionStatus): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('due_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions by status: ${error.message}`);
    }

    return TransactionMapper.toDomainArray(data as TransactionDB[]);
  }

  /**
   * Get transactions by reference period
   */
  async getByReferencePeriod(month: number, year: number): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('reference_month', month)
      .eq('reference_year', year)
      .order('due_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions by period: ${error.message}`);
    }

    return TransactionMapper.toDomainArray(data as TransactionDB[]);
  }

  /**
   * Get overdue transactions
   */
  async getOverdue(): Promise<Transaction[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', 'pending')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch overdue transactions: ${error.message}`);
    }

    return TransactionMapper.toDomainArray(data as TransactionDB[]);
  }

  /**
   * Mark transaction as paid
   */
  async markAsPaid(id: string, paidAt?: Date): Promise<Transaction> {
    return this.update(id, {
      status: 'paid',
      paidAt: paidAt || new Date(),
    });
  }

  /**
   * Get total revenue (sum of paid transactions)
   */
  async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('amount')
      .eq('status', 'paid');

    if (error) {
      throw new Error(`Failed to calculate total revenue: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 0;
    }

    return data.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
  }

  /**
   * Get pending amount (sum of pending transactions)
   */
  async getPendingAmount(): Promise<number> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('amount')
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to calculate pending amount: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 0;
    }

    return data.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
  }
}

