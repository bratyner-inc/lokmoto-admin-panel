import { useState, useEffect } from 'react';
import { MotorcycleRepository } from '@/data/repositories/MotorcycleRepository';
import { ProposalRepository } from '@/data/repositories/ProposalRepository';
import { DashboardStats } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const motorcycleRepository = new MotorcycleRepository();
const proposalRepository = new ProposalRepository();

interface UseDashboardReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch motorcycles and proposals in parallel
      const motorcycles = await motorcycleRepository.getAll(user.id);
      const proposals = await proposalRepository.getAll({ rentalCompanyId: user.id });

      // Calculate metrics
      const totalVehicles = motorcycles.length;
      const availableVehicles = motorcycles.filter(m => m.isAvailable).length;

      // Count unique customers from proposals
      const uniqueCustomerIds = new Set(proposals.map(p => p.customerId));
      const totalClients = uniqueCustomerIds.size;

      // Count proposals by status
      const pendingProposals = proposals.filter(p => 
        p.status === 'open' || p.status === 'pending'
      ).length;

      // Generate recent activity (last 10 items combined)
      const recentActivity: DashboardStats['recentActivity'] = [];

      // Add recent proposals
      const sortedProposals = [...proposals]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      sortedProposals.forEach(proposal => {
        const statusText = proposal.status === 'accepted' ? 'aceita' 
          : proposal.status === 'rejected' ? 'rejeitada' 
          : 'recebida';
        
        recentActivity.push({
          id: proposal.id,
          type: 'contract', // Using 'contract' as closest match to proposals
          description: `Proposta ${statusText} - ${proposal.motorcycle?.model || 'Moto'}`,
          timestamp: proposal.createdAt.toISOString(),
        });
      });

      // Add recent motorcycles
      const sortedMotorcycles = [...motorcycles]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      sortedMotorcycles.forEach(motorcycle => {
        recentActivity.push({
          id: motorcycle.id,
          type: 'vehicle',
          description: `Moto ${motorcycle.brand} ${motorcycle.model} adicionada ao estoque`,
          timestamp: motorcycle.createdAt.toISOString(),
        });
      });

      // Sort all activities by timestamp and take the 10 most recent
      recentActivity.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const finalActivity = recentActivity.slice(0, 10);

      // Build stats object
      const dashboardStats: DashboardStats = {
        totalClients,
        totalVehicles,
        activeContracts: 0, // Not implemented yet
        monthlyRevenue: 0, // Not implemented yet
        availableVehicles,
        pendingPayments: 0, // Not implemented yet
        recentActivity: finalActivity,
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    refresh: fetchDashboardStats,
  };
}

