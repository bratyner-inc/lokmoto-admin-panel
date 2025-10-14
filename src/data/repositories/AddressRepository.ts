/**
 * AddressRepository
 * Data layer - Supabase implementation of IAddressRepository
 */

import { supabase } from '@/infrastructure/config/supabase';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '@/domain/entities/Address';
import { IAddressRepository } from '@/domain/repositories/IAddressRepository';
import { AddressMapper, AddressDB } from '../mappers/AddressMapper';

export class AddressRepository implements IAddressRepository {
  private tableName = 'addresses';

  /**
   * Get address by ID
   */
  async getById(id: string): Promise<Address | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch address: ${error.message}`);
    }

    return AddressMapper.toDomain(data as AddressDB);
  }

  /**
   * Create new address (polimórfico: rental_company ou customer)
   */
  async create(dto: CreateAddressDTO, ownerType: string = 'rental_company', ownerId: string): Promise<Address> {
    const dbData = AddressMapper.toCreateDB(dto, ownerType, ownerId);

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create address: ${error.message}`);
    }

    return AddressMapper.toDomain(data as AddressDB);
  }

  /**
   * Update address
   */
  async update(id: string, dto: UpdateAddressDTO): Promise<Address> {
    const dbData = AddressMapper.toUpdateDB(dto);

    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update address: ${error.message}`);
    }

    return AddressMapper.toDomain(data as AddressDB);
  }

  /**
   * Delete address
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  }
}

