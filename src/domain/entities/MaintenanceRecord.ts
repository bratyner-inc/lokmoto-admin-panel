/**
 * MaintenanceRecord Entity
 * Domain layer - Core business entity for vehicle maintenance management
 */

export type MaintenanceType = 'preventiva' | 'corretiva' | 'sinistro';
export type MaintenanceStatus = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
export type MaintenancePriority = 'baixa' | 'media' | 'alta' | 'urgente';

/**
 * MaintenanceRecord - Registro de manutenção de veículo
 */
export interface MaintenanceRecord {
  id: string;
  rentalCompanyId: string;
  motorcycleId: string;
  
  // Informações básicas
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  
  // Custos e responsável
  estimatedCost?: number;
  actualCost?: number;
  mechanicName?: string;
  workshopName?: string;
  
  // Datas
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Feedback e notas
  customerReturn?: string;
  internalNotes?: string;
  
  // Documentos
  documents?: string[]; // URLs dos documentos no Storage
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MaintenanceRecordWithVehicle - Manutenção com dados do veículo
 */
export interface MaintenanceRecordWithVehicle extends MaintenanceRecord {
  motorcycle?: {
    id: string;
    model: string;
    brand: string;
    plate: string;
    year?: number;
  };
}

/**
 * CreateMaintenanceRecordDTO - Dados para criar nova manutenção
 */
export interface CreateMaintenanceRecordDTO {
  motorcycleId: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority?: MaintenancePriority;
  estimatedCost?: number;
  mechanicName?: string;
  workshopName?: string;
  scheduledDate?: Date;
  internalNotes?: string;
}

/**
 * UpdateMaintenanceRecordDTO - Dados para atualizar manutenção
 */
export interface UpdateMaintenanceRecordDTO {
  title?: string;
  description?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  estimatedCost?: number;
  actualCost?: number;
  mechanicName?: string;
  workshopName?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  customerReturn?: string;
  internalNotes?: string;
}

/**
 * MaintenanceStats - Estatísticas de manutenção
 */
export interface MaintenanceStats {
  total: number;
  byStatus: {
    agendada: number;
    em_andamento: number;
    concluida: number;
    cancelada: number;
  };
  byType: {
    preventiva: number;
    corretiva: number;
    sinistro: number;
  };
  costs: {
    total: number;
    average: number;
    estimated: number;
    actual: number;
  };
}

/**
 * Helpers para labels e badges
 */
export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  sinistro: 'Sinistro',
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const maintenancePriorityLabels: Record<MaintenancePriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const maintenanceTypeColors: Record<MaintenanceType, string> = {
  preventiva: 'blue',
  corretiva: 'orange',
  sinistro: 'red',
};

export const maintenanceStatusColors: Record<MaintenanceStatus, string> = {
  agendada: 'yellow',
  em_andamento: 'blue',
  concluida: 'green',
  cancelada: 'gray',
};

export const maintenancePriorityColors: Record<MaintenancePriority, string> = {
  baixa: 'gray',
  media: 'blue',
  alta: 'orange',
  urgente: 'red',
};

