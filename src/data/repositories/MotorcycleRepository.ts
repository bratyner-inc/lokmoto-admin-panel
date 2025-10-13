import { IMotorcycleRepository } from '@/domain/repositories/IMotorcycleRepository';
import { Motorcycle, CreateMotorcycleDTO, UpdateMotorcycleDTO } from '@/domain/entities/Motorcycle';
import { MotorcycleMapper, MotorcycleDB } from '@/data/mappers/MotorcycleMapper';
import { supabase } from '@/infrastructure/config/supabase';

export class MotorcycleRepository implements IMotorcycleRepository {
  async getAll(rentalCompanyId: string): Promise<Motorcycle[]> {
    const { data, error } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('rental_company_id', rentalCompanyId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch motorcycles: ${error.message}`);
    if (!data) return [];

    return data.map((item: MotorcycleDB) => MotorcycleMapper.toDomain(item));
  }

  async getById(id: string): Promise<Motorcycle | null> {
    const { data, error } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch motorcycle: ${error.message}`);
    }

    return data ? MotorcycleMapper.toDomain(data as MotorcycleDB) : null;
  }

  async getAvailable(rentalCompanyId?: string): Promise<Motorcycle[]> {
    let query = supabase
      .from('motorcycles')
      .select('*')
      .eq('is_available', true);

    if (rentalCompanyId) {
      query = query.eq('rental_company_id', rentalCompanyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch available motorcycles: ${error.message}`);
    if (!data) return [];

    return data.map((item: MotorcycleDB) => MotorcycleMapper.toDomain(item));
  }

  async search(query: string, rentalCompanyId?: string): Promise<Motorcycle[]> {
    let supabaseQuery = supabase
      .from('motorcycles')
      .select('*')
      .or(`brand.ilike.%${query}%,model.ilike.%${query}%,plate.ilike.%${query}%`);

    if (rentalCompanyId) {
      supabaseQuery = supabaseQuery.eq('rental_company_id', rentalCompanyId);
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to search motorcycles: ${error.message}`);
    if (!data) return [];

    return data.map((item: MotorcycleDB) => MotorcycleMapper.toDomain(item));
  }

  async create(dto: CreateMotorcycleDTO): Promise<Motorcycle> {
    const dbData = MotorcycleMapper.toCreateDB(dto);

    const { data, error } = await supabase
      .from('motorcycles')
      .insert(dbData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create motorcycle: ${error.message}`);
    if (!data) throw new Error('Failed to create motorcycle: No data returned');

    return MotorcycleMapper.toDomain(data as MotorcycleDB);
  }

  async update(id: string, dto: UpdateMotorcycleDTO): Promise<Motorcycle> {
    const dbData = MotorcycleMapper.toUpdateDB(dto);

    const { data, error } = await supabase
      .from('motorcycles')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update motorcycle: ${error.message}`);
    if (!data) throw new Error('Failed to update motorcycle: No data returned');

    return MotorcycleMapper.toDomain(data as MotorcycleDB);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('motorcycles')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete motorcycle: ${error.message}`);
  }

  async checkAvailability(motorcycleId: string, startDate: Date, endDate: Date): Promise<boolean> {
    // Check if motorcycle exists and is available
    const motorcycle = await this.getById(motorcycleId);
    if (!motorcycle || !motorcycle.isAvailable) return false;

    // Check for overlapping proposals/contracts
    const { data, error } = await supabase
      .from('proposals')
      .select('id')
      .eq('motorcycle_id', motorcycleId)
      .in('status', ['accepted', 'pending'])
      .or(`start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()}`);

    if (error) throw new Error(`Failed to check availability: ${error.message}`);

    return !data || data.length === 0;
  }

  async updateAvailability(motorcycleId: string, isAvailable: boolean): Promise<void> {
    const { error } = await supabase
      .from('motorcycles')
      .update({ is_available: isAvailable })
      .eq('id', motorcycleId);

    if (error) throw new Error(`Failed to update availability: ${error.message}`);
  }
}

