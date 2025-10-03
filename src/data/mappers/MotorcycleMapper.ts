import { Motorcycle } from '@/domain/entities/Motorcycle';

interface MotorcycleDB {
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
  daily_rate: number;
  is_available: boolean;
  availability_periods: any;
  created_at: string;
  updated_at: string;
}

export class MotorcycleMapper {
  static toDomain(raw: MotorcycleDB): Motorcycle {
    return {
      id: raw.id,
      rentalCompanyId: raw.rental_company_id,
      categoryId: raw.category_id || undefined,
      brand: raw.brand,
      model: raw.model,
      version: raw.version,
      year: raw.year,
      plate: raw.plate,
      renavam: raw.renavam,
      chassis: raw.chassis,
      color: raw.color,
      engineCapacity: raw.engine_capacity,
      dailyRate: raw.daily_rate,
      isAvailable: raw.is_available,
      availabilityPeriods: raw.availability_periods,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  static toDatabase(domain: Partial<Motorcycle>): Partial<MotorcycleDB> {
    return {
      ...(domain.rentalCompanyId && { rental_company_id: domain.rentalCompanyId }),
      ...(domain.categoryId !== undefined && { category_id: domain.categoryId || null }),
      ...(domain.brand && { brand: domain.brand }),
      ...(domain.model && { model: domain.model }),
      ...(domain.version && { version: domain.version }),
      ...(domain.year && { year: domain.year }),
      ...(domain.plate && { plate: domain.plate }),
      ...(domain.renavam && { renavam: domain.renavam }),
      ...(domain.chassis && { chassis: domain.chassis }),
      ...(domain.color && { color: domain.color }),
      ...(domain.engineCapacity && { engine_capacity: domain.engineCapacity }),
      ...(domain.dailyRate !== undefined && { daily_rate: domain.dailyRate }),
      ...(domain.isAvailable !== undefined && { is_available: domain.isAvailable }),
      ...(domain.availabilityPeriods && { availability_periods: domain.availabilityPeriods }),
    };
  }
}
