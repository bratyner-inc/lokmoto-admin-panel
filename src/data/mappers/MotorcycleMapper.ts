import { Motorcycle, CreateMotorcycleDTO, UpdateMotorcycleDTO } from '@/domain/entities/Motorcycle';

// Database representation
export interface MotorcycleDB {
  id: string;
  rental_company_id: string;
  category_id: string | null;
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  renavam: string;
  chassis: string;
  color: string;
  engine_capacity: number;
  is_available: boolean;
  availability_periods: any;
  daily_rate: number | null;
  images: any;
  created_at: string;
  updated_at: string;
}

export class MotorcycleMapper {
  static toDomain(db: MotorcycleDB): Motorcycle {
    return {
      id: db.id,
      rentalCompanyId: db.rental_company_id,
      categoryId: db.category_id || undefined,
      brand: db.brand,
      model: db.model,
      version: db.version,
      year: db.year,
      plate: db.plate,
      renavam: db.renavam,
      chassis: db.chassis,
      color: db.color,
      engineCapacity: db.engine_capacity,
      isAvailable: db.is_available,
      availabilityPeriods: db.availability_periods || undefined,
      dailyRate: db.daily_rate || undefined,
      images: db.images || undefined,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  static toCreateDB(dto: CreateMotorcycleDTO): Omit<MotorcycleDB, 'id' | 'created_at' | 'updated_at'> {
    return {
      rental_company_id: dto.rentalCompanyId,
      category_id: dto.categoryId || null,
      brand: dto.brand,
      model: dto.model,
      version: dto.version,
      year: dto.year,
      plate: dto.plate,
      renavam: dto.renavam,
      chassis: dto.chassis,
      color: dto.color,
      engine_capacity: dto.engineCapacity,
      is_available: dto.isAvailable ?? true,
      availability_periods: null,
      daily_rate: dto.dailyRate || null,
      images: null,
    };
  }

  static toUpdateDB(dto: UpdateMotorcycleDTO): Partial<MotorcycleDB> {
    const update: Partial<MotorcycleDB> = {};
    
    if (dto.categoryId !== undefined) update.category_id = dto.categoryId || null;
    if (dto.brand !== undefined) update.brand = dto.brand;
    if (dto.model !== undefined) update.model = dto.model;
    if (dto.version !== undefined) update.version = dto.version;
    if (dto.year !== undefined) update.year = dto.year;
    if (dto.plate !== undefined) update.plate = dto.plate;
    if (dto.renavam !== undefined) update.renavam = dto.renavam;
    if (dto.chassis !== undefined) update.chassis = dto.chassis;
    if (dto.color !== undefined) update.color = dto.color;
    if (dto.engineCapacity !== undefined) update.engine_capacity = dto.engineCapacity;
    if (dto.isAvailable !== undefined) update.is_available = dto.isAvailable;
    if (dto.dailyRate !== undefined) update.daily_rate = dto.dailyRate;
    if (dto.availabilityPeriods !== undefined) update.availability_periods = dto.availabilityPeriods;
    if (dto.images !== undefined) update.images = dto.images;
    
    return update;
  }
}

