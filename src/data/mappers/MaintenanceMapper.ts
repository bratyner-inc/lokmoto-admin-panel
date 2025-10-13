/**
 * MaintenanceMapper
 * Data layer - Maps between database and domain entities
 */

import {
  MaintenanceRecord,
  MaintenanceRecordWithVehicle,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
} from '@/domain/entities/MaintenanceRecord';

/**
 * Database representation of maintenance_records table
 */
export interface MaintenanceRecordDB {
  id: string;
  rental_company_id: string;
  motorcycle_id: string;
  title: string;
  description: string;
  maintenance_type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  estimated_cost: string | null;
  actual_cost: string | null;
  mechanic_name: string | null;
  workshop_name: string | null;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  customer_return: string | null;
  internal_notes: string | null;
  documents: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database representation with motorcycle joined
 */
export interface MaintenanceRecordWithVehicleDB extends MaintenanceRecordDB {
  motorcycles?: {
    id: string;
    model: string;
    brand: string;
    plate: string;
    year: number | null;
  };
}

export class MaintenanceMapper {
  /**
   * Convert database record to domain entity
   */
  static toDomain(raw: MaintenanceRecordDB): MaintenanceRecord {
    return {
      id: raw.id,
      rentalCompanyId: raw.rental_company_id,
      motorcycleId: raw.motorcycle_id,
      title: raw.title,
      description: raw.description,
      maintenanceType: raw.maintenance_type,
      status: raw.status,
      priority: raw.priority,
      estimatedCost: raw.estimated_cost ? parseFloat(raw.estimated_cost) : undefined,
      actualCost: raw.actual_cost ? parseFloat(raw.actual_cost) : undefined,
      mechanicName: raw.mechanic_name || undefined,
      workshopName: raw.workshop_name || undefined,
      scheduledDate: raw.scheduled_date ? new Date(raw.scheduled_date) : undefined,
      startedAt: raw.started_at ? new Date(raw.started_at) : undefined,
      completedAt: raw.completed_at ? new Date(raw.completed_at) : undefined,
      customerReturn: raw.customer_return || undefined,
      internalNotes: raw.internal_notes || undefined,
      documents: raw.documents || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Convert database record with vehicle to domain entity
   */
  static toDomainWithVehicle(raw: MaintenanceRecordWithVehicleDB): MaintenanceRecordWithVehicle {
    const base = this.toDomain(raw);
    return {
      ...base,
      motorcycle: raw.motorcycles
        ? {
            id: raw.motorcycles.id,
            model: raw.motorcycles.model,
            brand: raw.motorcycles.brand,
            plate: raw.motorcycles.plate,
            year: raw.motorcycles.year || undefined,
          }
        : undefined,
    };
  }

  /**
   * Convert create DTO to database format
   */
  static toCreateDB(dto: CreateMaintenanceRecordDTO, rentalCompanyId: string): Partial<MaintenanceRecordDB> {
    return {
      rental_company_id: rentalCompanyId,
      motorcycle_id: dto.motorcycleId,
      title: dto.title,
      description: dto.description,
      maintenance_type: dto.maintenanceType,
      priority: dto.priority || 'media',
      estimated_cost: dto.estimatedCost?.toString() || null,
      mechanic_name: dto.mechanicName || null,
      workshop_name: dto.workshopName || null,
      scheduled_date: dto.scheduledDate?.toISOString().split('T')[0] || null,
      internal_notes: dto.internalNotes || null,
    };
  }

  /**
   * Convert update DTO to database format
   */
  static toUpdateDB(dto: UpdateMaintenanceRecordDTO): Partial<MaintenanceRecordDB> {
    const update: Partial<MaintenanceRecordDB> = {};

    if (dto.title !== undefined) update.title = dto.title;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.priority !== undefined) update.priority = dto.priority;
    if (dto.estimatedCost !== undefined) update.estimated_cost = dto.estimatedCost?.toString() || null;
    if (dto.actualCost !== undefined) update.actual_cost = dto.actualCost?.toString() || null;
    if (dto.mechanicName !== undefined) update.mechanic_name = dto.mechanicName || null;
    if (dto.workshopName !== undefined) update.workshop_name = dto.workshopName || null;
    if (dto.scheduledDate !== undefined) {
      update.scheduled_date = dto.scheduledDate?.toISOString().split('T')[0] || null;
    }
    if (dto.startedAt !== undefined) update.started_at = dto.startedAt?.toISOString() || null;
    if (dto.completedAt !== undefined) update.completed_at = dto.completedAt?.toISOString() || null;
    if (dto.customerReturn !== undefined) update.customer_return = dto.customerReturn || null;
    if (dto.internalNotes !== undefined) update.internal_notes = dto.internalNotes || null;

    return update;
  }
}

