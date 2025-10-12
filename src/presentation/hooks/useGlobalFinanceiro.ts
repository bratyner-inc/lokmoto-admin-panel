import { useState, useEffect } from 'react';
import { TransactionWithDetails } from '@/domain/entities/Transaction';
import { GlobalTransactionFilters, GlobalTransactionStats } from '@/domain/repositories/ITransactionRepository';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';

const transactionRepository = new TransactionRepository();

/**
 * Hook to fetch global transactions (across all rental companies)
 * For Global Admin only
 */
export function useGlobalTransactions(filters?: GlobalTransactionFilters) {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionRepository.getAllGlobal(filters);
      setTransactions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters?.rentalCompanyId, filters?.month, filters?.year, filters?.status]);

  return {
    transactions,
    loading,
    error,
    refresh: fetchTransactions,
  };
}

/**
 * Hook to fetch global finance statistics
 * For Global Admin only
 */
export function useGlobalFinanceStats() {
  const [stats, setStats] = useState<GlobalTransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionRepository.getGlobalStats();
      setStats(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}


