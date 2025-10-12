/**
 * useMaintenance Hook
 * Presentation layer - React hook for maintenance management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MaintenanceRecord,
  MaintenanceRecordWithVehicle,
  CreateMaintenanceRecordDTO,
  UpdateMaintenanceRecordDTO,
  MaintenanceStatus,
  MaintenanceStats,
} from '@/domain/entities/MaintenanceRecord';
import { MaintenanceRepository } from '@/data/repositories/MaintenanceRepository';
import { useAuth } from '@/hooks/useAuth';

const maintenanceRepository = new MaintenanceRepository();

/**
 * Hook principal para gerenciar manutenções
 */
export function useMaintenance() {
  const { user } = useAuth();
  const [maintenances, setMaintenances] = useState<MaintenanceRecordWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaintenances = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceRepository.getAll();
      setMaintenances(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching maintenances:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const createMaintenance = async (dto: CreateMaintenanceRecordDTO): Promise<MaintenanceRecord> => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const newMaintenance = await maintenanceRepository.create(dto, user.id);
      await fetchMaintenances(); // Refresh list
      return newMaintenance;
    } catch (err) {
      throw err;
    }
  };

  const updateMaintenance = async (
    id: string,
    dto: UpdateMaintenanceRecordDTO
  ): Promise<MaintenanceRecord> => {
    try {
      const updated = await maintenanceRepository.update(id, dto);
      await fetchMaintenances(); // Refresh list
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteMaintenance = async (id: string): Promise<void> => {
    try {
      await maintenanceRepository.delete(id);
      await fetchMaintenances(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  const getByStatus = async (status: MaintenanceStatus): Promise<MaintenanceRecordWithVehicle[]> => {
    try {
      return await maintenanceRepository.getByStatus(status);
    } catch (err) {
      throw err;
    }
  };

  return {
    maintenances,
    loading,
    error,
    refresh: fetchMaintenances,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    getByStatus,
  };
}

/**
 * Hook para buscar uma manutenção específica por ID
 */
export function useMaintenanceRecord(id: string | undefined) {
  const [maintenance, setMaintenance] = useState<MaintenanceRecordWithVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaintenance = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceRepository.getById(id);
      setMaintenance(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching maintenance:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const updateMaintenance = async (dto: UpdateMaintenanceRecordDTO): Promise<MaintenanceRecord> => {
    if (!id) throw new Error('Maintenance ID is required');

    try {
      const updated = await maintenanceRepository.update(id, dto);
      await fetchMaintenance(); // Refresh data
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    maintenance,
    loading,
    error,
    refresh: fetchMaintenance,
    updateMaintenance,
  };
}

/**
 * Hook para buscar manutenções de um veículo específico
 */
export function useMaintenanceByMotorcycle(motorcycleId: string | undefined) {
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaintenances = useCallback(async () => {
    if (!motorcycleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceRepository.getByMotorcycle(motorcycleId);
      setMaintenances(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching maintenances by motorcycle:', err);
    } finally {
      setLoading(false);
    }
  }, [motorcycleId]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  return {
    maintenances,
    loading,
    error,
    refresh: fetchMaintenances,
  };
}

/**
 * Hook para estatísticas de manutenção
 */
export function useMaintenanceStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceRepository.getStats();
      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching maintenance stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

