/**
 * useRecentActivity Hook
 * Presentation layer - React hook for recent platform activity
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/config/supabase';

export interface RecentActivity {
  id: string;
  type: 'contract' | 'proposal' | 'ticket' | 'rental_company';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  rentalCompanyName?: string;
}

export function useRecentActivity(limit: number = 10) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const allActivities: RecentActivity[] = [];

        // Buscar contratos recentes
        const { data: contracts } = await supabase
          .from('contracts')
          .select(`
            id,
            contract_number,
            status,
            created_at,
            rental_companies!inner(company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (contracts) {
          contracts.forEach((contract: any) => {
            allActivities.push({
              id: contract.id,
              type: 'contract',
              title: `Novo Contrato ${contract.contract_number}`,
              description: `Contrato criado - Status: ${contract.status}`,
              timestamp: new Date(contract.created_at),
              status: contract.status,
              rentalCompanyName: contract.rental_companies?.company_name,
            });
          });
        }

        // Buscar propostas recentes
        const { data: proposals } = await supabase
          .from('proposals')
          .select(`
            id,
            proposal_number,
            status,
            created_at,
            rental_companies!inner(company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (proposals) {
          proposals.forEach((proposal: any) => {
            allActivities.push({
              id: proposal.id,
              type: 'proposal',
              title: `Nova Proposta ${proposal.proposal_number}`,
              description: `Proposta criada - Status: ${proposal.status}`,
              timestamp: new Date(proposal.created_at),
              status: proposal.status,
              rentalCompanyName: proposal.rental_companies?.company_name,
            });
          });
        }

        // Buscar tickets recentes
        const { data: tickets } = await supabase
          .from('tickets')
          .select(`
            id,
            subject,
            status,
            created_at,
            rental_companies!inner(company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (tickets) {
          tickets.forEach((ticket: any) => {
            allActivities.push({
              id: ticket.id,
              type: 'ticket',
              title: `Ticket: ${ticket.subject}`,
              description: `Status: ${ticket.status}`,
              timestamp: new Date(ticket.created_at),
              status: ticket.status,
              rentalCompanyName: ticket.rental_companies?.company_name,
            });
          });
        }

        // Buscar rental companies recentes
        const { data: rentalCompanies } = await supabase
          .from('rental_companies')
          .select('id, company_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (rentalCompanies) {
          rentalCompanies.forEach((company: any) => {
            allActivities.push({
              id: company.id,
              type: 'rental_company',
              title: `Nova Loja Cadastrada`,
              description: company.company_name,
              timestamp: new Date(company.created_at),
              rentalCompanyName: company.company_name,
            });
          });
        }

        // Ordenar por timestamp e limitar
        const sortedActivities = allActivities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);

        setActivities(sortedActivities);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  return { activities, loading, error };
}

