import { useState, useEffect } from 'react';
import { useRentalCompanyStats } from './useRentalCompanies';

export interface GlobalDashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  pendingCompanies: number;
  expiringSubscriptions: number;
}

/**
 * Hook to fetch Global Admin dashboard statistics
 */
export function useGlobalDashboard() {
  const { stats: companyStats, loading: loadingStats, error, refresh } = useRentalCompanyStats();
  const [stats, setStats] = useState<GlobalDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyStats) {
      setStats({
        totalCompanies: companyStats.total,
        activeCompanies: companyStats.active,
        inactiveCompanies: companyStats.inactive,
        pendingCompanies: companyStats.pending,
        expiringSubscriptions: companyStats.expiringIn7Days,
      });
    }
    setLoading(loadingStats);
  }, [companyStats, loadingStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}


