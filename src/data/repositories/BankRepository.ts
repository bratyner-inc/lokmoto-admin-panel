/**
 * BankRepository
 * Data layer - Supabase implementation of IBankRepository
 */

import { supabase } from '@/infrastructure/config/supabase';
import { Bank } from '@/domain/entities/Bank';
import { IBankRepository } from '@/domain/repositories/IBankRepository';
import { BankMapper, BankDB } from '../mappers/BankMapper';

export class BankRepository implements IBankRepository {
  private tableName = 'banks';

  /**
   * Get all banks ordered by name
   */
  async getAll(): Promise<Bank[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch banks: ${error.message}`);
    }

    return data.map((item) => BankMapper.toDomain(item as BankDB));
  }

  /**
   * Get bank by code
   */
  async getByCode(code: string): Promise<Bank | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch bank: ${error.message}`);
    }

    return BankMapper.toDomain(data as BankDB);
  }
}

