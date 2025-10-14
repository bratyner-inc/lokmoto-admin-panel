import { Proposal, CreateProposalDTO, UpdateProposalDTO, ProposalStatus } from '@/domain/entities/Proposal';

// Database representation
export interface ProposalDB {
  id: string;
  proposal_number: string;
  customer_id: string;
  motorcycle_id: string;
  rental_company_id: string;
  status: ProposalStatus;
  start_date: string;
  end_date: string;
  proposed_daily_rate: number | null;
  monthly_value: number | null;
  notes: string | null;
  contract_id: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined relations (optional)
  customers?: {
    id: string;
    full_name: string;
    email: string;
  };
  motorcycles?: {
    id: string;
    brand: string;
    model: string;
    plate: string;
  };
}

export class ProposalMapper {
  static toDomain(db: ProposalDB): Proposal {
    return {
      id: db.id,
      proposalNumber: db.proposal_number,
      customerId: db.customer_id,
      motorcycleId: db.motorcycle_id,
      rentalCompanyId: db.rental_company_id,
      status: db.status,
      startDate: new Date(db.start_date),
      endDate: new Date(db.end_date),
      proposedDailyRate: db.proposed_daily_rate || undefined,
      monthlyValue: db.monthly_value || undefined,
      notes: db.notes || undefined,
      contractId: db.contract_id || undefined,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
      customer: db.customers ? {
        id: db.customers.id,
        fullName: db.customers.full_name,
        email: db.customers.email,
      } : undefined,
      motorcycle: db.motorcycles ? {
        id: db.motorcycles.id,
        brand: db.motorcycles.brand,
        model: db.motorcycles.model,
        plate: db.motorcycles.plate,
      } : undefined,
    };
  }

  static toCreateDB(dto: CreateProposalDTO): Omit<ProposalDB, 'id' | 'proposal_number' | 'contract_id' | 'created_at' | 'updated_at' | 'customers' | 'motorcycles'> {
    return {
      customer_id: dto.customerId,
      motorcycle_id: dto.motorcycleId,
      rental_company_id: dto.rentalCompanyId,
      status: 'open',
      start_date: dto.startDate.toISOString(),
      end_date: dto.endDate.toISOString(),
      proposed_daily_rate: dto.proposedDailyRate || null,
      monthly_value: dto.monthlyValue || null,
      notes: dto.notes || null,
    };
  }

  static toUpdateDB(dto: UpdateProposalDTO): Partial<ProposalDB> {
    const update: Partial<ProposalDB> = {};
    
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.proposedDailyRate !== undefined) update.proposed_daily_rate = dto.proposedDailyRate;
    if (dto.notes !== undefined) update.notes = dto.notes;
    
    return update;
  }
}

