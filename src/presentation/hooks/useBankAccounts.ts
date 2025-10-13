/**
 * useBankAccounts Hook
 * Presentation layer - React hook for rental company bank accounts management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BankAccountWithBank,
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
} from '@/domain/entities/RentalCompanyBankAccount';
import { RentalCompanyBankAccountRepository } from '@/data/repositories/RentalCompanyBankAccountRepository';
import { useAuth } from '@/hooks/useAuth';

const bankAccountRepository = new RentalCompanyBankAccountRepository();

/**
 * Hook to manage bank accounts for the logged-in rental company
 */
export function useBankAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccountWithBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await bankAccountRepository.getAll(user.id);
      setAccounts(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching bank accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (dto: CreateBankAccountDTO) => {
    if (!user?.id) throw new Error('User not authenticated');

    const newAccount = await bankAccountRepository.create(dto, user.id);
    await fetchAccounts(); // Refresh list
    return newAccount;
  };

  const updateAccount = async (id: string, dto: UpdateBankAccountDTO) => {
    const updated = await bankAccountRepository.update(id, dto);
    await fetchAccounts(); // Refresh list
    return updated;
  };

  const deleteAccount = async (id: string) => {
    await bankAccountRepository.delete(id);
    await fetchAccounts(); // Refresh list
  };

  const setPrimary = async (id: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    await bankAccountRepository.setPrimary(id, user.id);
    await fetchAccounts(); // Refresh list
  };

  return {
    accounts,
    loading,
    error,
    refresh: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setPrimary,
  };
}

