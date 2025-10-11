// Domain entity for Proposal
export type ProposalStatus = 
  | 'open' 
  | 'pending' 
  | 'answered_company' 
  | 'answered_customer' 
  | 'closed' 
  | 'accepted' 
  | 'rejected';

export interface Proposal {
  id: string;
  customerId: string;
  motorcycleId: string;
  rentalCompanyId: string;
  status: ProposalStatus;
  startDate: Date;
  endDate: Date;
  proposedDailyRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional, populated when needed)
  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
  motorcycle?: {
    id: string;
    brand: string;
    model: string;
    plate: string;
  };
}

export interface CreateProposalDTO {
  customerId: string;
  motorcycleId: string;
  rentalCompanyId: string;
  startDate: Date;
  endDate: Date;
  proposedDailyRate?: number;
  notes?: string;
}

export interface UpdateProposalDTO {
  status?: ProposalStatus;
  proposedDailyRate?: number;
  notes?: string;
}

