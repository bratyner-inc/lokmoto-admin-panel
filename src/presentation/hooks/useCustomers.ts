import { useState, useEffect } from 'react';
import { Customer, CustomerWithLicense } from '@/domain/entities/Customer';
import { CustomerRepository } from '@/data/repositories/CustomerRepository';

const customerRepository = new CustomerRepository();

/**
 * Hook to fetch and manage customers list
 */
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCustomers = await customerRepository.getAll();
      setCustomers(fetchedCustomers);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const refetch = () => {
    fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    setLoading(true);
    try {
      await customerRepository.delete(id);
      await fetchCustomers();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await customerRepository.search(query);
      setCustomers(results);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    customers, 
    loading, 
    error, 
    refetch, 
    deleteCustomer,
    searchCustomers 
  };
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCustomer = await customerRepository.getById(id);
        setCustomer(fetchedCustomer);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    } else {
      setCustomer(null);
      setLoading(false);
    }
  }, [id]);

  return { customer, loading, error };
}

/**
 * Hook to fetch a customer with driver license details
 */
export function useCustomerWithLicense(id: string) {
  const [customer, setCustomer] = useState<CustomerWithLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomer = async () => {
    if (!id) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedCustomer = await customerRepository.getByIdWithLicense(id);
      setCustomer(fetchedCustomer);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const refetch = () => {
    fetchCustomer();
  };

  return { customer, loading, error, refetch };
}

