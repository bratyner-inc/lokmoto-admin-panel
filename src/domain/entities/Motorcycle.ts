export interface VehicleCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  engineCapacity: number;
  dailyRate: number;
  isAvailable: boolean;
  availabilityPeriods?: Array<{
    start: Date;
    end: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
