import { supabase } from '@/integrations/supabase/client';
import { IMotorcycleRepository } from '@/domain/interfaces/IMotorcycleRepository';
import { Motorcycle, VehicleCategory } from '@/domain/entities/Motorcycle';
import { MotorcycleMapper } from '@/data/mappers/MotorcycleMapper';

export class SupabaseMotorcycleRepository implements IMotorcycleRepository {
  async getAll(rentalCompanyId?: string): Promise<Motorcycle[]> {
    let query = supabase
      .from('motorcycles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (rentalCompanyId) {
      query = query.eq('rental_company_id', rentalCompanyId);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data.map(MotorcycleMapper.toDomain);
  }
  
  async getAvailable(): Promise<Motorcycle[]> {
    const { data, error } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data.map(MotorcycleMapper.toDomain);
  }
  
  async getById(id: string): Promise<Motorcycle | null> {
    const { data, error } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw new Error(error.message);
    return data ? MotorcycleMapper.toDomain(data) : null;
  }
  
  async create(motorcycle: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Motorcycle> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const insertData = {
      rental_company_id: user.id,
      brand: motorcycle.brand,
      model: motorcycle.model,
      version: motorcycle.version,
      year: motorcycle.year,
      plate: motorcycle.plate,
      renavam: motorcycle.renavam,
      chassis: motorcycle.chassis,
      color: motorcycle.color,
      engine_capacity: motorcycle.engineCapacity,
      is_available: motorcycle.isAvailable,
      ...(motorcycle.categoryId && { category_id: motorcycle.categoryId }),
      ...(motorcycle.availabilityPeriods && { availability_periods: motorcycle.availabilityPeriods }),
    } as any;
    
    const { data, error } = await supabase
      .from('motorcycles')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return MotorcycleMapper.toDomain(data);
  }
  
  async update(id: string, motorcycle: Partial<Motorcycle>): Promise<Motorcycle> {
    const { data, error } = await supabase
      .from('motorcycles')
      .update(MotorcycleMapper.toDatabase(motorcycle))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return MotorcycleMapper.toDomain(data);
  }
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('motorcycles')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
  
  async getCategories(): Promise<VehicleCategory[]> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return data.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || undefined,
      createdAt: new Date(cat.created_at),
      updatedAt: new Date(cat.updated_at),
    }));
  }
}
