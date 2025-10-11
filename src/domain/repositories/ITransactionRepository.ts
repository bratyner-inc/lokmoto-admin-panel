import { 
  Transaction, 
  TransactionWithDetails,
  CreateTransactionDTO, 
  UpdateTransactionDTO,
  TransactionStatus,
  PaymentMethod
} from '../entities/Transaction';

export interface ITransactionRepository {
  /**
   * Get all transactions for the authenticated rental company
   */
  getAll(): Promise<Transaction[]>;

  /**
   * Get a single transaction by ID
   */
  getById(id: string): Promise<Transaction | null>;

  /**
   * Get a transaction with full details (contract, customer, etc.)
   */
  getByIdWithDetails(id: string): Promise<TransactionWithDetails | null>;

  /**
   * Create a new transaction
   */
  create(data: CreateTransactionDTO, rentalCompanyAuthId: string): Promise<Transaction>;

  /**
   * Update an existing transaction
   */
  update(id: string, data: UpdateTransactionDTO): Promise<Transaction>;

  /**
   * Delete a transaction
   */
  delete(id: string): Promise<void>;

  /**
   * Get transactions by contract ID
   */
  getByContractId(contractId: string): Promise<Transaction[]>;

  /**
   * Get transactions by customer ID
   */
  getByCustomerId(customerId: string): Promise<Transaction[]>;

  /**
   * Get transactions by status
   */
  getByStatus(status: TransactionStatus): Promise<Transaction[]>;

  /**
   * Get transactions by reference period (month/year)
   */
  getByReferencePeriod(month: number, year: number): Promise<Transaction[]>;

  /**
   * Get overdue transactions
   */
  getOverdue(): Promise<Transaction[]>;

  /**
   * Mark transaction as paid
   */
  markAsPaid(id: string, paidAt?: Date): Promise<Transaction>;

  /**
   * Get total revenue (paid transactions)
   */
  getTotalRevenue(): Promise<number>;

  /**
   * Get pending amount (unpaid transactions)
   */
  getPendingAmount(): Promise<number>;
}

