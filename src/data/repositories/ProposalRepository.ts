import { IProposalRepository, ProposalFilters } from '@/domain/repositories/IProposalRepository';
import { Proposal, CreateProposalDTO, UpdateProposalDTO, ProposalStatus } from '@/domain/entities/Proposal';
import { ProposalMapper, ProposalDB } from '@/data/mappers/ProposalMapper';
import { supabase } from '@/infrastructure/config/supabase';

export class ProposalRepository implements IProposalRepository {
  async getAll(filters?: ProposalFilters): Promise<Proposal[]> {
    let query = supabase
      .from('proposals')
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `);

    if (filters) {
      if (filters.rentalCompanyId) query = query.eq('rental_company_id', filters.rentalCompanyId);
      if (filters.customerId) query = query.eq('customer_id', filters.customerId);
      if (filters.motorcycleId) query = query.eq('motorcycle_id', filters.motorcycleId);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.startDate) query = query.gte('start_date', filters.startDate.toISOString());
      if (filters.endDate) query = query.lte('end_date', filters.endDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch proposals: ${error.message}`);
    if (!data) return [];

    return data.map((item: any) => ProposalMapper.toDomain(item as ProposalDB));
  }

  async getById(id: string): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch proposal: ${error.message}`);
    }

    return data ? ProposalMapper.toDomain(data as any) : null;
  }

  async getByRentalCompany(rentalCompanyId: string, status?: ProposalStatus): Promise<Proposal[]> {
    let query = supabase
      .from('proposals')
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `)
      .eq('rental_company_id', rentalCompanyId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch proposals: ${error.message}`);
    if (!data) return [];

    return data.map((item: any) => ProposalMapper.toDomain(item as ProposalDB));
  }

  async getByCustomer(customerId: string, status?: ProposalStatus): Promise<Proposal[]> {
    let query = supabase
      .from('proposals')
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `)
      .eq('customer_id', customerId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch proposals: ${error.message}`);
    if (!data) return [];

    return data.map((item: any) => ProposalMapper.toDomain(item as ProposalDB));
  }

  async getByMotorcycle(motorcycleId: string): Promise<Proposal[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `)
      .eq('motorcycle_id', motorcycleId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch proposals: ${error.message}`);
    if (!data) return [];

    return data.map((item: any) => ProposalMapper.toDomain(item as ProposalDB));
  }

  async create(dto: CreateProposalDTO): Promise<Proposal> {
    const dbData = ProposalMapper.toCreateDB(dto);

    const { data, error } = await supabase
      .from('proposals')
      .insert(dbData)
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `)
      .single();

    if (error) throw new Error(`Failed to create proposal: ${error.message}`);
    if (!data) throw new Error('Failed to create proposal: No data returned');

    return ProposalMapper.toDomain(data as any);
  }

  async update(id: string, dto: UpdateProposalDTO): Promise<Proposal> {
    const dbData = ProposalMapper.toUpdateDB(dto);

    const { data, error } = await supabase
      .from('proposals')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        customers:customer_id (id, full_name, email),
        motorcycles:motorcycle_id (id, brand, model, plate)
      `)
      .single();

    if (error) throw new Error(`Failed to update proposal: ${error.message}`);
    if (!data) throw new Error('Failed to update proposal: No data returned');

    return ProposalMapper.toDomain(data as any);
  }

  async updateStatus(id: string, status: ProposalStatus): Promise<Proposal> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete proposal: ${error.message}`);
  }
}

