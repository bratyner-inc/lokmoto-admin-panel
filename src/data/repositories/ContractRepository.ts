import { IContractRepository } from '@/domain/repositories/IContractRepository';
import { Contract, CreateContractDTO, UpdateContractDTO, ContractWithDetails } from '@/domain/entities/Contract';
import { supabase } from '@/infrastructure/config/supabase';
import { ContractMapper, ContractDB, ContractWithDetailsDB } from '../mappers/ContractMapper';

export class ContractRepository implements IContractRepository {
  private tableName = 'contracts';

  /**
   * Get all contracts for the authenticated rental company
   */
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw new Error('Failed to fetch contracts');
    }

    return ContractMapper.toDomainArray(data as ContractDB[]);
  }

  /**
   * Get a single contract by ID
   */
  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching contract:', error);
      throw new Error('Failed to fetch contract');
    }

    return ContractMapper.toDomain(data as ContractDB);
  }

  /**
   * Get a contract with related details (customer, motorcycle, proposal)
   */
  async getByIdWithDetails(id: string): Promise<ContractWithDetails | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        customers(id, full_name, email, phone),
        motorcycles(id, brand, model, version, year, plate),
        proposals!contracts_proposal_id_fkey(id, proposal_number, status)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching contract with details:', error);
      throw new Error('Failed to fetch contract details');
    }

    return ContractMapper.toDomainWithDetails(data as ContractWithDetailsDB);
  }

  /**
   * Get contracts by rental company ID
   */
  async getByRentalCompanyId(rentalCompanyId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('rental_company_id', rentalCompanyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts by rental company:', error);
      throw new Error('Failed to fetch contracts');
    }

    return ContractMapper.toDomainArray(data as ContractDB[]);
  }

  /**
   * Get contracts by customer ID
   */
  async getByCustomerId(customerId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false});

    if (error) {
      console.error('Error fetching contracts by customer:', error);
      throw new Error('Failed to fetch contracts');
    }

    return ContractMapper.toDomainArray(data as ContractDB[]);
  }

  /**
   * Get contracts by motorcycle ID
   */
  async getByMotorcycleId(motorcycleId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('motorcycle_id', motorcycleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts by motorcycle:', error);
      throw new Error('Failed to fetch contracts');
    }

    return ContractMapper.toDomainArray(data as ContractDB[]);
  }

  /**
   * Get active contracts count
   */
  async getActiveCount(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      console.error('Error counting active contracts:', error);
      throw new Error('Failed to count active contracts');
    }

    return count || 0;
  }

  /**
   * Create a new contract from an approved proposal
   */
  async create(data: CreateContractDTO, rentalCompanyId: string): Promise<Contract> {
    // Format dates for PostgreSQL
    const startDate = data.startDate instanceof Date 
      ? data.startDate.toISOString().split('T')[0] 
      : data.startDate;
    
    const endDate = data.endDate 
      ? (data.endDate instanceof Date 
        ? data.endDate.toISOString().split('T')[0] 
        : data.endDate)
      : null;

    const { data: contractData, error } = await supabase
      .from(this.tableName)
      .insert({
        rental_company_id: rentalCompanyId,
        customer_id: data.customerId,
        proposal_id: data.proposalId,
        motorcycle_id: data.motorcycleId,
        start_date: startDate,
        end_date: endDate,
        monthly_value: data.monthlyValue,
        payment_day: data.paymentDay,
        notes: data.notes || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      throw new Error('Failed to create contract');
    }

    return ContractMapper.toDomain(contractData as ContractDB);
  }

  /**
   * Update an existing contract
   */
  async update(id: string, data: UpdateContractDTO): Promise<Contract> {
    const updateData: any = {};

    if (data.endDate !== undefined) {
      updateData.end_date = data.endDate 
        ? (data.endDate instanceof Date 
          ? data.endDate.toISOString().split('T')[0] 
          : data.endDate)
        : null;
    }
    if (data.monthlyValue !== undefined) updateData.monthly_value = data.monthlyValue;
    if (data.paymentDay !== undefined) updateData.payment_day = data.paymentDay;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cancellationDate !== undefined) {
      updateData.cancellation_date = data.cancellationDate ? data.cancellationDate.toISOString() : null;
    }
    if (data.cancellationReason !== undefined) updateData.cancellation_reason = data.cancellationReason;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: contractData, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      throw new Error('Failed to update contract');
    }

    return ContractMapper.toDomain(contractData as ContractDB);
  }

  /**
   * Cancel a contract
   */
  async cancel(id: string, reason: string): Promise<Contract> {
    const { data: contractData, error } = await supabase
      .from(this.tableName)
      .update({
        status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling contract:', error);
      throw new Error('Failed to cancel contract');
    }

    return ContractMapper.toDomain(contractData as ContractDB);
  }

  /**
   * Delete a contract (soft delete by marking as cancelled)
   */
  async delete(id: string): Promise<void> {
    await this.cancel(id, 'Contract deleted by user');
  }
}

