import { Proposal, CreateProposalDTO, UpdateProposalDTO, ProposalStatus } from '../entities/Proposal';

export interface IProposalRepository {
  // Query methods
  getAll(filters?: ProposalFilters): Promise<Proposal[]>;
  getById(id: string): Promise<Proposal | null>;
  getByRentalCompany(rentalCompanyId: string, status?: ProposalStatus): Promise<Proposal[]>;
  getByCustomer(customerId: string, status?: ProposalStatus): Promise<Proposal[]>;
  getByMotorcycle(motorcycleId: string): Promise<Proposal[]>;
  
  // Mutation methods
  create(data: CreateProposalDTO): Promise<Proposal>;
  update(id: string, data: UpdateProposalDTO): Promise<Proposal>;
  updateStatus(id: string, status: ProposalStatus): Promise<Proposal>;
  delete(id: string): Promise<void>;
}

export interface ProposalFilters {
  rentalCompanyId?: string;
  customerId?: string;
  motorcycleId?: string;
  status?: ProposalStatus;
  startDate?: Date;
  endDate?: Date;
}

