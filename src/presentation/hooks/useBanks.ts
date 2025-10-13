/**
 * useBanks Hook
 * Presentation layer - React hook for banks management
 */

import { useState, useEffect } from 'react';
import { Bank } from '@/domain/entities/Bank';
import { BankRepository } from '@/data/repositories/BankRepository';

const bankRepository = new BankRepository();

/**
 * Hook to fetch all banks
 */
export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await bankRepository.getAll();
        setBanks(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching banks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  return { banks, loading, error };
}

