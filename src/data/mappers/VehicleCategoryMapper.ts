import { VehicleCategory } from '@/domain/entities/VehicleCategory';

// Database representation
export interface VehicleCategoryDB {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export class VehicleCategoryMapper {
  static toDomain(db: VehicleCategoryDB): VehicleCategory {
    return {
      id: db.id,
      name: db.name,
      description: db.description || undefined,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }
}

