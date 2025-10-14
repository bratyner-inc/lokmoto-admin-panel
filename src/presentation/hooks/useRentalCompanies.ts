import { useState, useEffect } from 'react';
import { RentalCompany, CreateRentalCompanyDTO, UpdateRentalCompanyDTO } from '@/domain/entities/RentalCompany';
import { SubscriptionStatus, RentalCompanyStats } from '@/domain/repositories/IRentalCompanyRepository';
import { RentalCompanyRepository } from '@/data/repositories/RentalCompanyRepository';

const rentalCompanyRepository = new RentalCompanyRepository();

/**
 * Hook to fetch and manage rental companies
 */
export function useRentalCompanies(filterStatus?: SubscriptionStatus) {
  const [companies, setCompanies] = useState<RentalCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCompanies = filterStatus
        ? await rentalCompanyRepository.getByStatus(filterStatus)
        : await rentalCompanyRepository.getAll();
      setCompanies(fetchedCompanies);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filterStatus]);

  const createCompany = async (data: CreateRentalCompanyDTO, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const newCompany = await rentalCompanyRepository.create(data, password);
      setCompanies(prev => [newCompany, ...prev]);
      return newCompany;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (id: string, data: UpdateRentalCompanyDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await rentalCompanyRepository.update(id, data);
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await rentalCompanyRepository.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const suspendCompany = async (id: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await rentalCompanyRepository.suspendCompany(id, reason);
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateCompany = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await rentalCompanyRepository.activateCompany(id);
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    loading,
    error,
    refresh: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    suspendCompany,
    activateCompany,
  };
}

/**
 * Hook to fetch a single rental company
 */
export function useRentalCompany(id: string) {
  const [company, setCompany] = useState<RentalCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const fetchedCompany = await rentalCompanyRepository.getById(id);
        setCompany(fetchedCompany);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  return { company, loading, error };
}

/**
 * Hook to fetch rental company statistics
 */
export function useRentalCompanyStats() {
  const [stats, setStats] = useState<RentalCompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedStats = await rentalCompanyRepository.getStats();
      setStats(fetchedStats);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refresh: fetchStats };
}

/**
 * Hook to fetch expiring subscriptions
 */
export function useExpiringSubscriptions(days: number = 7) {
  const [companies, setCompanies] = useState<RentalCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExpiring = async () => {
      setLoading(true);
      setError(null);
      try {
        const expiring = await rentalCompanyRepository.getExpiringSubscriptions(days);
        setCompanies(expiring);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiring();
  }, [days]);

  return { companies, loading, error };
}


