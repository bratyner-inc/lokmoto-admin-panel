/**
 * BankMapper
 * Data layer - Maps between database and domain entities
 */

import { Bank } from '@/domain/entities/Bank';

/**
 * Database representation of banks table
 */
export interface BankDB {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export class BankMapper {
  /**
   * Convert database record to domain entity
   */
  static toDomain(raw: BankDB): Bank {
    return {
      id: raw.id,
      code: raw.code,
      name: raw.name,
      createdAt: new Date(raw.created_at),
    };
  }
}

