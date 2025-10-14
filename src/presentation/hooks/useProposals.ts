import { useState, useEffect } from 'react';
import { Proposal, UpdateProposalDTO, ProposalStatus } from '@/domain/entities/Proposal';
import { ProposalRepository } from '@/data/repositories/ProposalRepository';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const proposalRepository = new ProposalRepository();

export function useProposals(status?: ProposalStatus) {
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await proposalRepository.getByRentalCompany(user.id, status);
      setProposals(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch proposals';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user?.id, status]);

  const updateProposal = async (id: string, dto: UpdateProposalDTO) => {
    setLoading(true);
    try {
      const updated = await proposalRepository.update(id, dto);
      setProposals(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Proposta atualizada com sucesso!');
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update proposal';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptProposal = async (id: string) => {
    return updateProposal(id, { status: 'accepted' });
  };

  const rejectProposal = async (id: string) => {
    return updateProposal(id, { status: 'rejected' });
  };

  return {
    proposals,
    loading,
    error,
    fetchProposals,
    updateProposal,
    acceptProposal,
    rejectProposal,
  };
}

export function useProposal(id: string) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await proposalRepository.getById(id);
      setProposal(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch proposal';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [id]);

  return {
    proposal,
    loading,
    error,
    refetch: fetchProposal,
  };
}

