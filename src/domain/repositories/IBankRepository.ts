/**
 * IBankRepository Interface
 * Domain layer - Repository contract for banks
 */

import { Bank } from '../entities/Bank';

export interface IBankRepository {
  /**
   * Get all banks
   */
  getAll(): Promise<Bank[]>;

  /**
   * Get bank by code
   */
  getByCode(code: string): Promise<Bank | null>;
}

