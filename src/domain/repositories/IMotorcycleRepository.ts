import { Motorcycle, CreateMotorcycleDTO, UpdateMotorcycleDTO } from '../entities/Motorcycle';

export interface IMotorcycleRepository {
  // Query methods
  getAll(rentalCompanyId: string): Promise<Motorcycle[]>;
  getById(id: string): Promise<Motorcycle | null>;
  getAvailable(rentalCompanyId?: string): Promise<Motorcycle[]>;
  search(query: string, rentalCompanyId?: string): Promise<Motorcycle[]>;
  
  // Mutation methods
  create(data: CreateMotorcycleDTO): Promise<Motorcycle>;
  update(id: string, data: UpdateMotorcycleDTO): Promise<Motorcycle>;
  delete(id: string): Promise<void>;
  
  // Utility methods
  checkAvailability(motorcycleId: string, startDate: Date, endDate: Date): Promise<boolean>;
  updateAvailability(motorcycleId: string, isAvailable: boolean): Promise<void>;
}

