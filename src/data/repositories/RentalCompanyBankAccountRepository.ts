/**
 * RentalCompanyBankAccountRepository
 * Data layer - Supabase implementation of IRentalCompanyBankAccountRepository
 */

import { supabase } from '@/infrastructure/config/supabase';
import {
  RentalCompanyBankAccount,
  BankAccountWithBank,
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
} from '@/domain/entities/RentalCompanyBankAccount';
import { IRentalCompanyBankAccountRepository } from '@/domain/repositories/IRentalCompanyBankAccountRepository';
import {
  RentalCompanyBankAccountMapper,
  BankAccountDB,
  BankAccountWithBankDB,
} from '../mappers/RentalCompanyBankAccountMapper';

export class RentalCompanyBankAccountRepository implements IRentalCompanyBankAccountRepository {
  private tableName = 'rental_company_bank_accounts';

  /**
   * Get all bank accounts for a rental company
   */
  async getAll(rentalCompanyId: string): Promise<BankAccountWithBank[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, banks(id, code, name, created_at)')
      .eq('rental_company_id', rentalCompanyId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bank accounts: ${error.message}`);
    }

    return data.map((item) =>
      RentalCompanyBankAccountMapper.toDomainWithBank(item as BankAccountWithBankDB)
    );
  }

  /**
   * Get bank account by ID
   */
  async getById(id: string): Promise<BankAccountWithBank | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, banks(id, code, name, created_at)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch bank account: ${error.message}`);
    }

    return RentalCompanyBankAccountMapper.toDomainWithBank(data as BankAccountWithBankDB);
  }

  /**
   * Create new bank account
   */
  async create(
    dto: CreateBankAccountDTO,
    rentalCompanyId: string
  ): Promise<RentalCompanyBankAccount> {
    const dbData = RentalCompanyBankAccountMapper.toCreateDB(dto, rentalCompanyId);

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bank account: ${error.message}`);
    }

    return RentalCompanyBankAccountMapper.toDomain(data as BankAccountDB);
  }

  /**
   * Update bank account
   */
  async update(id: string, dto: UpdateBankAccountDTO): Promise<RentalCompanyBankAccount> {
    const dbData = RentalCompanyBankAccountMapper.toUpdateDB(dto);

    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update bank account: ${error.message}`);
    }

    return RentalCompanyBankAccountMapper.toDomain(data as BankAccountDB);
  }

  /**
   * Delete bank account
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete bank account: ${error.message}`);
    }
  }

  /**
   * Set bank account as primary (unsets other primary accounts)
   */
  async setPrimary(id: string, rentalCompanyId: string): Promise<void> {
    // First, unset all other primary accounts for this rental company
    await supabase
      .from(this.tableName)
      .update({ is_primary: false })
      .eq('rental_company_id', rentalCompanyId);

    // Then set this account as primary
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_primary: true })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to set primary account: ${error.message}`);
    }
  }
}

