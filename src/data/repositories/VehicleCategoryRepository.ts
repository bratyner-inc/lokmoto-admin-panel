import { IVehicleCategoryRepository } from '@/domain/repositories/IVehicleCategoryRepository';
import { VehicleCategory } from '@/domain/entities/VehicleCategory';
import { VehicleCategoryMapper, VehicleCategoryDB } from '@/data/mappers/VehicleCategoryMapper';
import { supabase } from '@/infrastructure/config/supabase';

export class VehicleCategoryRepository implements IVehicleCategoryRepository {
  async getAll(): Promise<VehicleCategory[]> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch vehicle categories: ${error.message}`);
    if (!data) return [];

    return data.map((item: VehicleCategoryDB) => VehicleCategoryMapper.toDomain(item));
  }

  async getById(id: string): Promise<VehicleCategory | null> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch vehicle category: ${error.message}`);
    }

    return data ? VehicleCategoryMapper.toDomain(data as VehicleCategoryDB) : null;
  }

  async getByName(name: string): Promise<VehicleCategory | null> {
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch vehicle category: ${error.message}`);
    }

    return data ? VehicleCategoryMapper.toDomain(data as VehicleCategoryDB) : null;
  }
}

