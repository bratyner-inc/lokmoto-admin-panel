import { useState, useEffect } from 'react';
import { Customer } from '@/domain/entities/Customer';
import { CustomerWithRentalCompany, GlobalCustomerStats } from '@/domain/repositories/ICustomerRepository';
import { CustomerRepository } from '@/data/repositories/CustomerRepository';

const customerRepository = new CustomerRepository();

/**
 * Hook to fetch all customers across all rental companies (Global Admin only)
 */
export function useGlobalCustomers() {
  const [customers, setCustomers] = useState<CustomerWithRentalCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerRepository.getAllGlobal();
      setCustomers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const suspendCustomer = async (id: string) => {
    setError(null);
    try {
      await customerRepository.suspendCustomer(id);
      await fetchCustomers();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const activateCustomer = async (id: string) => {
    setError(null);
    try {
      await customerRepository.activateCustomer(id);
      await fetchCustomers();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    refresh: fetchCustomers,
    suspendCustomer,
    activateCustomer,
  };
}

/**
 * Hook to fetch global customer statistics (Global Admin only)
 */
export function useGlobalCustomerStats() {
  const [stats, setStats] = useState<GlobalCustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerRepository.getGlobalStats();
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


