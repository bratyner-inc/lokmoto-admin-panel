import { useState, useEffect } from 'react';
import { Contract, ContractStatus } from '@/domain/entities/Contract';
import { ContractRepository } from '@/data/repositories/ContractRepository';

const contractRepository = new ContractRepository();

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractRepository.getAll();
      setContracts(data);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  /**
   * Filter contracts by status
   */
  const getByStatus = (status: ContractStatus) => {
    return contracts.filter(contract => contract.status === status);
  };

  /**
   * Get contract statistics
   */
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    suspended: contracts.filter(c => c.status === 'suspended').length,
    cancelled: contracts.filter(c => c.status === 'cancelled').length,
    completed: contracts.filter(c => c.status === 'completed').length,
  };

  /**
   * Refresh contracts list
   */
  const refresh = () => {
    fetchContracts();
  };

  return {
    contracts,
    loading,
    error,
    getByStatus,
    stats,
    refresh,
  };
}

/**
 * Hook for a single contract with details
 */
export function useContract(id: string) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractRepository.getByIdWithDetails(id);
      setContract(data);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  /**
   * Cancel the contract
   */
  const cancelContract = async (reason: string) => {
    try {
      setError(null);
      const updated = await contractRepository.cancel(id, reason);
      setContract(updated);
      return { success: true };
    } catch (err) {
      console.error('Error cancelling contract:', err);
      setError('Failed to cancel contract');
      return { success: false, error: 'Failed to cancel contract' };
    }
  };

  /**
   * Refresh contract data
   */
  const refresh = () => {
    fetchContract();
  };

  return {
    contract,
    loading,
    error,
    cancelContract,
    refresh,
  };
}

/**
 * Hook for contracts by customer
 */
export function useCustomerContracts(customerId: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!customerId) {
        setContracts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await contractRepository.getByCustomerId(customerId);
        setContracts(data);
      } catch (err) {
        console.error('Error fetching customer contracts:', err);
        setError('Failed to fetch contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [customerId]);

  return {
    contracts,
    loading,
    error,
  };
}

/**
 * Hook for contracts by motorcycle
 */
export function useMotorcycleContracts(motorcycleId: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!motorcycleId) {
        setContracts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await contractRepository.getByMotorcycleId(motorcycleId);
        setContracts(data);
      } catch (err) {
        console.error('Error fetching motorcycle contracts:', err);
        setError('Failed to fetch contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [motorcycleId]);

  return {
    contracts,
    loading,
    error,
  };
}

