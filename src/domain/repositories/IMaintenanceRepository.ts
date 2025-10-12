/**
 * IMaintenanceRepository Interface
 * Domain layer - Repository contract for maintenance records
 */

import {
  MaintenanceRecord,
  MaintenanceRecordWithVehicle,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceStatus,
  MaintenanceStats,
} from '../entities/MaintenanceRecord';

/**
 * Interface para repositório de manutenções
 */
export interface IMaintenanceRepository {
  /**
   * Buscar todas as manutenções da locadora
   */
  getAll(): Promise<MaintenanceRecordWithVehicle[]>;

  /**
   * Buscar manutenção por ID
   */
  getById(id: string): Promise<MaintenanceRecordWithVehicle | null>;

  /**
   * Buscar manutenções por veículo
   */
  getByMotorcycle(motorcycleId: string): Promise<MaintenanceRecord[]>;

  /**
   * Buscar manutenções por status
   */
  getByStatus(status: MaintenanceStatus): Promise<MaintenanceRecordWithVehicle[]>;

  /**
   * Criar nova manutenção
   */
  create(data: CreateMaintenanceRecordDTO, rentalCompanyId: string): Promise<MaintenanceRecord>;

  /**
   * Atualizar manutenção
   */
  update(id: string, data: UpdateMaintenanceRecordDTO): Promise<MaintenanceRecord>;

  /**
   * Deletar manutenção
   */
  delete(id: string): Promise<void>;

  /**
   * Buscar estatísticas de manutenção
   */
  getStats(): Promise<MaintenanceStats>;
}

