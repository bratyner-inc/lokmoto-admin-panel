import { useState, useEffect } from 'react';
import { Transaction, TransactionWithDetails, TransactionStatus } from '@/domain/entities/Transaction';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';

const transactionRepository = new TransactionRepository();

/**
 * Hook to fetch and manage transactions list
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await transactionRepository.getAll();
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const refetch = () => {
    fetchTransactions();
  };

  const deleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      await transactionRepository.delete(id);
      await fetchTransactions();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    transactions, 
    loading, 
    error, 
    refetch, 
    deleteTransaction 
  };
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransaction = async () => {
    if (!id) {
      setTransaction(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedTransaction = await transactionRepository.getByIdWithDetails(id);
      setTransaction(fetchedTransaction);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const markAsPaid = async () => {
    if (!transaction) return;
    setLoading(true);
    try {
      const updatedTransaction = await transactionRepository.markAsPaid(transaction.id);
      await fetchTransaction(); // Refetch to get updated details
      return updatedTransaction;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTransaction();
  };

  return { transaction, loading, error, markAsPaid, refetch };
}

/**
 * Hook to get transactions by contract
 */
export function useContractTransactions(contractId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!contractId) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedTransactions = await transactionRepository.getByContractId(contractId);
        setTransactions(fetchedTransactions);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [contractId]);

  return { transactions, loading, error };
}

/**
 * Hook to get transactions by status
 */
export function useTransactionsByStatus(status: TransactionStatus) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedTransactions = await transactionRepository.getByStatus(status);
        setTransactions(fetchedTransactions);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [status]);

  return { transactions, loading, error };
}

/**
 * Hook to get overdue transactions
 */
export function useOverdueTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await transactionRepository.getOverdue();
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const refetch = () => {
    fetchTransactions();
  };

  return { transactions, loading, error, refetch };
}

/**
 * Hook to get payment statistics
 */
export function usePaymentStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [totalRevenue, pendingAmount] = await Promise.all([
        transactionRepository.getTotalRevenue(),
        transactionRepository.getPendingAmount(),
      ]);
      setStats({ totalRevenue, pendingAmount });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return { stats, loading, error, refetch };
}

