/**
 * IAddressRepository Interface
 * Domain layer - Repository contract for addresses
 */

import { Address, CreateAddressDTO, UpdateAddressDTO } from '../entities/Address';

export interface IAddressRepository {
  /**
   * Get address by ID
   */
  getById(id: string): Promise<Address | null>;

  /**
   * Create new address (polimórfico)
   */
  create(data: CreateAddressDTO, ownerType: string, ownerId: string): Promise<Address>;

  /**
   * Update address
   */
  update(id: string, data: UpdateAddressDTO): Promise<Address>;

  /**
   * Delete address
   */
  delete(id: string): Promise<void>;
}

