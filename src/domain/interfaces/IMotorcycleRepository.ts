import { Motorcycle, VehicleCategory } from '../entities/Motorcycle';

export interface IMotorcycleRepository {
  getAll(rentalCompanyId?: string): Promise<Motorcycle[]>;
  getAvailable(): Promise<Motorcycle[]>;
  getById(id: string): Promise<Motorcycle | null>;
  create(motorcycle: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Motorcycle>;
  update(id: string, motorcycle: Partial<Motorcycle>): Promise<Motorcycle>;
  delete(id: string): Promise<void>;
  
  // Categories
  getCategories(): Promise<VehicleCategory[]>;
}
