/**
 * RentalCompanyBankAccountMapper
 * Data layer - Maps between database and domain entities
 */

import {
  RentalCompanyBankAccount,
  BankAccountWithBank,
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
  BankAccountType,
  PixKeyType,
} from '@/domain/entities/RentalCompanyBankAccount';
import { BankMapper } from './BankMapper';

/**
 * Database representation of rental_company_bank_accounts table
 */
export interface BankAccountDB {
  id: string;
  rental_company_id: string;
  bank_code: string;
  account_type: string;
  agency: string;
  account_number: string;
  account_digit: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Database representation with bank joined
 */
export interface BankAccountWithBankDB extends BankAccountDB {
  banks?: any;
}

export class RentalCompanyBankAccountMapper {
  /**
   * Convert database record to domain entity
   */
  static toDomain(raw: BankAccountDB): RentalCompanyBankAccount {
    return {
      id: raw.id,
      rentalCompanyId: raw.rental_company_id,
      bankCode: raw.bank_code,
      accountType: raw.account_type as BankAccountType,
      agency: raw.agency,
      accountNumber: raw.account_number,
      accountDigit: raw.account_digit || undefined,
      pixKey: raw.pix_key || undefined,
      pixKeyType: raw.pix_key_type as PixKeyType | undefined,
      isPrimary: raw.is_primary,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Convert database record with bank to domain entity
   */
  static toDomainWithBank(raw: BankAccountWithBankDB): BankAccountWithBank {
    const base = this.toDomain(raw);
    return {
      ...base,
      bank: raw.banks ? BankMapper.toDomain(raw.banks) : undefined,
    };
  }

  /**
   * Convert create DTO to database format
   */
  static toCreateDB(dto: CreateBankAccountDTO, rentalCompanyId: string): Partial<BankAccountDB> {
    return {
      rental_company_id: rentalCompanyId,
      bank_code: dto.bankCode,
      account_type: dto.accountType,
      agency: dto.agency,
      account_number: dto.accountNumber,
      account_digit: dto.accountDigit || null,
      pix_key: dto.pixKey || null,
      pix_key_type: dto.pixKeyType || null,
      is_primary: dto.isPrimary || false,
    };
  }

  /**
   * Convert update DTO to database format
   */
  static toUpdateDB(dto: UpdateBankAccountDTO): Partial<BankAccountDB> {
    const update: Partial<BankAccountDB> = {};

    if (dto.accountType !== undefined) update.account_type = dto.accountType;
    if (dto.agency !== undefined) update.agency = dto.agency;
    if (dto.accountNumber !== undefined) update.account_number = dto.accountNumber;
    if (dto.accountDigit !== undefined) update.account_digit = dto.accountDigit || null;
    if (dto.pixKey !== undefined) update.pix_key = dto.pixKey || null;
    if (dto.pixKeyType !== undefined) update.pix_key_type = dto.pixKeyType || null;

    return update;
  }
}

