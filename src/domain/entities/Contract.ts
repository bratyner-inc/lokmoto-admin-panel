// Contract domain entity
export type ContractStatus = 'active' | 'suspended' | 'cancelled' | 'completed';

export interface Contract {
  id: string;
  contractNumber: string;
  rentalCompanyId: string;
  customerId: string;
  proposalId: string;
  motorcycleId: string;
  startDate: Date;
  endDate: Date | null; // null for open-ended contracts
  monthlyValue: number;
  paymentDay: number; // 1-28
  status: ContractStatus;
  cancellationDate: Date | null;
  cancellationReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractDTO {
  proposalId: string;
  motorcycleId: string;
  customerId: string;
  startDate: Date;
  endDate?: Date | null;
  monthlyValue: number;
  paymentDay: number;
  notes?: string;
}

export interface UpdateContractDTO {
  endDate?: Date | null;
  monthlyValue?: number;
  paymentDay?: number;
  status?: ContractStatus;
  cancellationDate?: Date | null;
  cancellationReason?: string | null;
  notes?: string | null;
}

// Contract with related entities (for detailed views)
export interface ContractWithDetails extends Contract {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  motorcycle?: {
    id: string;
    brand: string;
    model: string;
    version: string;
    year: number;
    plate: string;
  };
  proposal?: {
    id: string;
    proposalNumber: string;
    status: string;
  };
}

