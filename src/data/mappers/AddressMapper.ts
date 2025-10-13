/**
 * AddressMapper
 * Data layer - Maps between database and domain entities
 */

import { Address, CreateAddressDTO, UpdateAddressDTO } from '@/domain/entities/Address';

/**
 * Database representation of addresses table (polimórfica)
 */
export interface AddressDB {
  id: string;
  owner_type: string; // 'rental_company' | 'customer'
  owner_id: string;
  street: string;
  number: string;
  complement: string | null;
  district: string; // bairro
  city: string;
  state: string;
  postal_code: string; // CEP
  country: string;
  created_at: string;
  updated_at: string;
}

export class AddressMapper {
  /**
   * Convert database record to domain entity
   */
  static toDomain(raw: AddressDB): Address {
    return {
      id: raw.id,
      street: raw.street || undefined,
      number: raw.number || undefined,
      complement: raw.complement || undefined,
      neighborhood: raw.district || undefined, // district → neighborhood
      city: raw.city || undefined,
      state: raw.state || undefined,
      zipCode: raw.postal_code || undefined, // postal_code → zipCode
      country: raw.country || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Convert create DTO to database format (polimórfico)
   */
  static toCreateDB(dto: CreateAddressDTO, ownerType: string, ownerId: string): Partial<AddressDB> {
    return {
      owner_type: ownerType,
      owner_id: ownerId,
      street: dto.street || '',
      number: dto.number || '',
      complement: dto.complement || null,
      district: dto.neighborhood || '', // neighborhood → district
      city: dto.city || '',
      state: dto.state || '',
      postal_code: dto.zipCode || '', // zipCode → postal_code
      country: dto.country || 'Brazil',
    };
  }

  /**
   * Convert update DTO to database format
   */
  static toUpdateDB(dto: UpdateAddressDTO): Partial<AddressDB> {
    const update: Partial<AddressDB> = {};

    if (dto.street !== undefined) update.street = dto.street || '';
    if (dto.number !== undefined) update.number = dto.number || '';
    if (dto.complement !== undefined) update.complement = dto.complement || null;
    if (dto.neighborhood !== undefined) update.district = dto.neighborhood || ''; // neighborhood → district
    if (dto.city !== undefined) update.city = dto.city || '';
    if (dto.state !== undefined) update.state = dto.state || '';
    if (dto.zipCode !== undefined) update.postal_code = dto.zipCode || ''; // zipCode → postal_code
    if (dto.country !== undefined) update.country = dto.country || 'Brazil';

    return update;
  }
}


