/**
 * MaintenanceRepository
 * Data layer - Supabase implementation of IMaintenanceRepository
 */

import { supabase } from '@/infrastructure/config/supabase';
import {
  MaintenanceRecord,
  MaintenanceRecordWithVehicle,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceStatus,
  MaintenanceStats,
} from '@/domain/entities/MaintenanceRecord';
import { IMaintenanceRepository } from '@/domain/repositories/IMaintenanceRepository';
import {
  MaintenanceMapper,
  MaintenanceRecordDB,
  MaintenanceRecordWithVehicleDB,
} from '../mappers/MaintenanceMapper';

export class MaintenanceRepository implements IMaintenanceRepository {
  private tableName = 'maintenance_records';

  /**
   * Buscar todas as manutenções da locadora logada
   */
  async getAll(): Promise<MaintenanceRecordWithVehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(
        `
        *,
        motorcycles (
          id,
          model,
          brand,
          plate,
          year
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch maintenance records: ${error.message}`);
    }

    return data.map((item) =>
      MaintenanceMapper.toDomainWithVehicle(item as MaintenanceRecordWithVehicleDB)
    );
  }

  /**
   * Buscar manutenção por ID
   */
  async getById(id: string): Promise<MaintenanceRecordWithVehicle | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(
        `
        *,
        motorcycles (
          id,
          model,
          brand,
          plate,
          year
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch maintenance record: ${error.message}`);
    }

    return MaintenanceMapper.toDomainWithVehicle(data as MaintenanceRecordWithVehicleDB);
  }

  /**
   * Buscar manutenções por veículo
   */
  async getByMotorcycle(motorcycleId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('motorcycle_id', motorcycleId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch maintenance records by motorcycle: ${error.message}`);
    }

    return data.map((item) => MaintenanceMapper.toDomain(item as MaintenanceRecordDB));
  }

  /**
   * Buscar manutenções por status
   */
  async getByStatus(status: MaintenanceStatus): Promise<MaintenanceRecordWithVehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(
        `
        *,
        motorcycles (
          id,
          model,
          brand,
          plate,
          year
        )
      `
      )
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch maintenance records by status: ${error.message}`);
    }

    return data.map((item) =>
      MaintenanceMapper.toDomainWithVehicle(item as MaintenanceRecordWithVehicleDB)
    );
  }

  /**
   * Criar nova manutenção
   */
  async create(
    dto: CreateMaintenanceRecordDTO,
    rentalCompanyId: string
  ): Promise<MaintenanceRecord> {
    const dbData = MaintenanceMapper.toCreateDB(dto, rentalCompanyId);

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create maintenance record: ${error.message}`);
    }

    return MaintenanceMapper.toDomain(data as MaintenanceRecordDB);
  }

  /**
   * Atualizar manutenção
   */
  async update(id: string, dto: UpdateMaintenanceRecordDTO): Promise<MaintenanceRecord> {
    const dbData = MaintenanceMapper.toUpdateDB(dto);

    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update maintenance record: ${error.message}`);
    }

    return MaintenanceMapper.toDomain(data as MaintenanceRecordDB);
  }

  /**
   * Deletar manutenção
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete maintenance record: ${error.message}`);
    }
  }

  /**
   * Buscar estatísticas de manutenção
   */
  async getStats(): Promise<MaintenanceStats> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('status, maintenance_type, estimated_cost, actual_cost');

    if (error) {
      throw new Error(`Failed to fetch maintenance stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        total: 0,
        byStatus: { agendada: 0, em_andamento: 0, concluida: 0, cancelada: 0 },
        byType: { preventiva: 0, corretiva: 0, sinistro: 0 },
        costs: { total: 0, average: 0, estimated: 0, actual: 0 },
      };
    }

    // Contar por status
    const byStatus = {
      agendada: data.filter((r) => r.status === 'agendada').length,
      em_andamento: data.filter((r) => r.status === 'em_andamento').length,
      concluida: data.filter((r) => r.status === 'concluida').length,
      cancelada: data.filter((r) => r.status === 'cancelada').length,
    };

    // Contar por tipo
    const byType = {
      preventiva: data.filter((r) => r.maintenance_type === 'preventiva').length,
      corretiva: data.filter((r) => r.maintenance_type === 'corretiva').length,
      sinistro: data.filter((r) => r.maintenance_type === 'sinistro').length,
    };

    // Calcular custos
    const estimatedCosts = data
      .map((r) => (r.estimated_cost ? parseFloat(r.estimated_cost) : 0))
      .filter((c) => c > 0);

    const actualCosts = data
      .map((r) => (r.actual_cost ? parseFloat(r.actual_cost) : 0))
      .filter((c) => c > 0);

    const totalEstimated = estimatedCosts.reduce((sum, c) => sum + c, 0);
    const totalActual = actualCosts.reduce((sum, c) => sum + c, 0);
    const total = totalActual > 0 ? totalActual : totalEstimated;
    const average = actualCosts.length > 0 ? totalActual / actualCosts.length : 0;

    return {
      total: data.length,
      byStatus,
      byType,
      costs: {
        total,
        average,
        estimated: totalEstimated,
        actual: totalActual,
      },
    };
  }
}

