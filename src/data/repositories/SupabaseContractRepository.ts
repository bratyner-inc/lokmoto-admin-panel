import { supabase } from '@/integrations/supabase/client';
import { Contract } from '@/domain/entities/Contract';
import { ContractMapper } from '@/data/mappers/ContractMapper';

export interface IContractRepository {
  getAll(rentalCompanyId?: string): Promise<Contract[]>;
  getById(id: string): Promise<Contract | null>;
  create(contract: Omit<Contract, 'createdAt' | 'updatedAt'>): Promise<Contract>;
  update(id: string, contract: Partial<Contract>): Promise<Contract>;
  delete(id: string): Promise<void>;
}

export class SupabaseContractRepository implements IContractRepository {
  async getAll(rentalCompanyId?: string): Promise<Contract[]> {
    let query = supabase
      .from('contracts')
      .select(`
        *,
        customers!inner(id, full_name, email, phone, document_id),
        motorcycles!inner(id, brand, model, plate, year)
      `)
      .order('created_at', { ascending: false });

    if (rentalCompanyId) {
      query = query.eq('rental_company_id', rentalCompanyId);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data.map(ContractMapper.toDomain);
  }
  
  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        customers!inner(id, full_name, email, phone, document_id),
        motorcycles!inner(id, brand, model, plate, year, color, chassis, renavam)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw new Error(error.message);
    return data ? ContractMapper.toDomain(data) : null;
  }
  
  async create(contract: Omit<Contract, 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        id: contract.id,
        customer_id: contract.customerId,
        motorcycle_id: contract.motorcycleId,
        rental_company_id: contract.rentalCompanyId,
        proposal_id: contract.proposalId || null,
        contract_file: contract.contractFile || null,
        status: contract.status,
        start_date: contract.startDate.toISOString().split('T')[0],
        end_date: contract.endDate.toISOString().split('T')[0],
        observations: contract.observations || null,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return ContractMapper.toDomain(data);
  }
  
  async update(id: string, contract: Partial<Contract>): Promise<Contract> {
    const updateData: any = {};
    
    if (contract.customerId) updateData.customer_id = contract.customerId;
    if (contract.motorcycleId) updateData.motorcycle_id = contract.motorcycleId;
    if (contract.rentalCompanyId) updateData.rental_company_id = contract.rentalCompanyId;
    if (contract.proposalId !== undefined) updateData.proposal_id = contract.proposalId || null;
    if (contract.contractFile !== undefined) updateData.contract_file = contract.contractFile || null;
    if (contract.status) updateData.status = contract.status;
    if (contract.startDate) updateData.start_date = contract.startDate.toISOString().split('T')[0];
    if (contract.endDate) updateData.end_date = contract.endDate.toISOString().split('T')[0];
    if (contract.observations !== undefined) updateData.observations = contract.observations || null;
    
    const { data, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return ContractMapper.toDomain(data);
  }
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
}
