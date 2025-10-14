import { VehicleCategory } from '../entities/VehicleCategory';

export interface IVehicleCategoryRepository {
  // Query methods
  getAll(): Promise<VehicleCategory[]>;
  getById(id: string): Promise<VehicleCategory | null>;
  getByName(name: string): Promise<VehicleCategory | null>;
}

