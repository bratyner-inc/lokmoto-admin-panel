/**
 * RentalCompanyBankAccount Entity
 * Domain layer - Conta bancária da locadora
 */

import { Bank } from './Bank';

export type BankAccountType = 'corrente' | 'poupanca';
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

/**
 * Conta bancária da locadora
 */
export interface RentalCompanyBankAccount {
  id: string;
  rentalCompanyId: string;
  bankCode: string;
  accountType: BankAccountType;
  agency: string;
  accountNumber: string;
  accountDigit?: string;
  pixKey?: string;
  pixKeyType?: PixKeyType;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conta bancária com dados do banco (joined)
 */
export interface BankAccountWithBank extends RentalCompanyBankAccount {
  bank?: Bank;
}

/**
 * DTO para criar conta bancária
 */
export interface CreateBankAccountDTO {
  bankCode: string;
  accountType: BankAccountType;
  agency: string;
  accountNumber: string;
  accountDigit?: string;
  pixKey?: string;
  pixKeyType?: PixKeyType;
  isPrimary?: boolean;
}

/**
 * DTO para atualizar conta bancária
 */
export interface UpdateBankAccountDTO {
  accountType?: BankAccountType;
  agency?: string;
  accountNumber?: string;
  accountDigit?: string;
  pixKey?: string;
  pixKeyType?: PixKeyType;
}

