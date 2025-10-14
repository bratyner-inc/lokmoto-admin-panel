/**
 * useGlobalDashboardStats Hook
 * Presentation layer - React hook for global admin dashboard statistics
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/config/supabase';

export interface GlobalDashboardStats {
  totalRentalCompanies: number;
  activeRentalCompanies: number;
  suspendedRentalCompanies: number;
  newRentalCompaniesThisMonth: number;
  totalContracts: number;
  activeContracts: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalTickets: number;
  openTickets: number;
  totalCustomers: number;
  totalMotorcycles: number;
}

export function useGlobalDashboardStats() {
  const [stats, setStats] = useState<GlobalDashboardStats>({
    totalRentalCompanies: 0,
    activeRentalCompanies: 0,
    suspendedRentalCompanies: 0,
    newRentalCompaniesThisMonth: 0,
    totalContracts: 0,
    activeContracts: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalTickets: 0,
    openTickets: 0,
    totalCustomers: 0,
    totalMotorcycles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Buscar stats de rental companies
        const { data: companies } = await supabase
          .from('rental_companies')
          .select('id, is_suspended, created_at');

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalRentalCompanies = companies?.length || 0;
        const suspendedRentalCompanies = companies?.filter(c => c.is_suspended).length || 0;
        const activeRentalCompanies = totalRentalCompanies - suspendedRentalCompanies;
        const newRentalCompaniesThisMonth = companies?.filter(c => 
          new Date(c.created_at) >= firstDayOfMonth
        ).length || 0;

        // Buscar stats de contratos
        const { data: contracts } = await supabase
          .from('contracts')
          .select('id, status');

        const totalContracts = contracts?.length || 0;
        const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;

        // Buscar stats de receita (transações pagas)
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, status, paid_at');

        const paidTransactions = transactions?.filter(t => t.status === 'paid') || [];
        const totalRevenue = paidTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const revenueThisMonth = paidTransactions
          .filter(t => new Date(t.paid_at) >= firstDayOfMonth)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Buscar stats de tickets
        const { data: tickets } = await supabase
          .from('tickets')
          .select('id, status');

        const totalTickets = tickets?.length || 0;
        const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0;

        // Buscar stats de customers e motorcycles
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        const { count: motorcyclesCount } = await supabase
          .from('motorcycles')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalRentalCompanies,
          activeRentalCompanies,
          suspendedRentalCompanies,
          newRentalCompaniesThisMonth,
          totalContracts,
          activeContracts,
          totalRevenue,
          revenueThisMonth,
          totalTickets,
          openTickets,
          totalCustomers: customersCount || 0,
          totalMotorcycles: motorcyclesCount || 0,
        });
      } catch (err) {
        console.error('Error fetching global dashboard stats:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

