/**
 * IRentalCompanyBankAccountRepository Interface
 * Domain layer - Repository contract for rental company bank accounts
 */

import {
  RentalCompanyBankAccount,
  BankAccountWithBank,
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
} from '../entities/RentalCompanyBankAccount';

export interface IRentalCompanyBankAccountRepository {
  /**
   * Get all bank accounts for a rental company
   */
  getAll(rentalCompanyId: string): Promise<BankAccountWithBank[]>;

  /**
   * Get bank account by ID
   */
  getById(id: string): Promise<BankAccountWithBank | null>;

  /**
   * Create new bank account
   */
  create(
    data: CreateBankAccountDTO,
    rentalCompanyId: string
  ): Promise<RentalCompanyBankAccount>;

  /**
   * Update bank account
   */
  update(id: string, data: UpdateBankAccountDTO): Promise<RentalCompanyBankAccount>;

  /**
   * Delete bank account
   */
  delete(id: string): Promise<void>;

  /**
   * Set bank account as primary (unsets other primary accounts)
   */
  setPrimary(id: string, rentalCompanyId: string): Promise<void>;
}

