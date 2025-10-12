import { useState, useEffect } from 'react';
import { Safe2PayPlan } from '@/domain/entities/Safe2PayPlan';
import { Safe2PayRepository } from '@/data/repositories/Safe2PayRepository';

const safe2PayRepository = new Safe2PayRepository();

/**
 * Hook to fetch and manage Safe2Pay plans
 */
export function useSafe2PayPlans(activeOnly: boolean = false) {
  const [plans, setPlans] = useState<Safe2PayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlans = activeOnly
        ? await safe2PayRepository.getActivePlans()
        : await safe2PayRepository.getPlans();
      setPlans(fetchedPlans);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [activeOnly]);

  const syncPlans = async () => {
    setSyncing(true);
    setError(null);
    try {
      const syncedPlans = await safe2PayRepository.syncPlans();
      setPlans(syncedPlans);
      return syncedPlans;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const deactivatePlan = async (idPlan: number) => {
    setError(null);
    try {
      await safe2PayRepository.deactivatePlan(idPlan);
      await fetchPlans();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const activatePlan = async (idPlan: number) => {
    setError(null);
    try {
      await safe2PayRepository.activatePlan(idPlan);
      await fetchPlans();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    plans,
    loading,
    error,
    syncing,
    refresh: fetchPlans,
    syncPlans,
    deactivatePlan,
    activatePlan,
  };
}

/**
 * Hook to fetch a single Safe2Pay plan
 */
export function useSafe2PayPlan(idPlan: number | null) {
  const [plan, setPlan] = useState<Safe2PayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (idPlan === null) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedPlan = await safe2PayRepository.getPlanById(idPlan);
        setPlan(fetchedPlan);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [idPlan]);

  return { plan, loading, error };
}


