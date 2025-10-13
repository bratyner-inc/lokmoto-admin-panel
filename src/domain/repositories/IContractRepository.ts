import { Contract, CreateContractDTO, UpdateContractDTO, ContractWithDetails } from '../entities/Contract';

export interface IContractRepository {
  /**
   * Get all contracts for the authenticated rental company
   */
  getAll(): Promise<Contract[]>;

  /**
   * Get a single contract by ID
   */
  getById(id: string): Promise<Contract | null>;

  /**
   * Get a contract with related details (customer, motorcycle, proposal)
   */
  getByIdWithDetails(id: string): Promise<ContractWithDetails | null>;

  /**
   * Get contracts by rental company ID
   */
  getByRentalCompanyId(rentalCompanyId: string): Promise<Contract[]>;

  /**
   * Get contracts by customer ID
   */
  getByCustomerId(customerId: string): Promise<Contract[]>;

  /**
   * Get contracts by motorcycle ID
   */
  getByMotorcycleId(motorcycleId: string): Promise<Contract[]>;

  /**
   * Get active contracts count
   */
  getActiveCount(): Promise<number>;

  /**
   * Create a new contract from an approved proposal
   */
  create(data: CreateContractDTO, rentalCompanyId: string): Promise<Contract>;

  /**
   * Update an existing contract
   */
  update(id: string, data: UpdateContractDTO): Promise<Contract>;

  /**
   * Cancel a contract
   */
  cancel(id: string, reason: string): Promise<Contract>;

  /**
   * Delete a contract (soft delete by marking as cancelled)
   */
  delete(id: string): Promise<void>;
}

