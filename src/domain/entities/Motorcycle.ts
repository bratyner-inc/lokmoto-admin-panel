// Domain entity for Motorcycle
export interface Motorcycle {
  id: string;
  rentalCompanyId: string;
  categoryId?: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  renavam: string;
  chassis: string;
  color: string;
  engineCapacity: number; // cilindrada em cc
  isAvailable: boolean;
  availabilityPeriods?: AvailabilityPeriod[];
  dailyRate?: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityPeriod {
  start: Date;
  end: Date;
}

export interface CreateMotorcycleDTO {
  rentalCompanyId: string;
  categoryId?: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  renavam: string;
  chassis: string;
  color: string;
  engineCapacity: number;
  dailyRate?: number;
  isAvailable?: boolean;
  images?: string[];
}

export interface UpdateMotorcycleDTO {
  categoryId?: string;
  brand?: string;
  model?: string;
  version?: string;
  year?: number;
  plate?: string;
  renavam?: string;
  chassis?: string;
  color?: string;
  engineCapacity?: number;
  dailyRate?: number;
  isAvailable?: boolean;
  availabilityPeriods?: AvailabilityPeriod[];
  images?: string[];
}

