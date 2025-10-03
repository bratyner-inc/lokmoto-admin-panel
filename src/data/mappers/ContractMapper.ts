import { Contract } from '@/domain/entities/Contract';

interface ContractDB {
  id: string;
  proposal_id: string | null;
  customer_id: string;
  motorcycle_id: string;
  rental_company_id: string;
  contract_file: string | null;
  status: string;
  start_date: string;
  end_date: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export class ContractMapper {
  static toDomain(raw: ContractDB): Contract {
    return {
      id: raw.id,
      proposalId: raw.proposal_id || undefined,
      customerId: raw.customer_id,
      motorcycleId: raw.motorcycle_id,
      rentalCompanyId: raw.rental_company_id,
      contractFile: raw.contract_file || undefined,
      status: raw.status as Contract['status'],
      startDate: new Date(raw.start_date),
      endDate: new Date(raw.end_date),
      observations: raw.observations || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  static toDatabase(domain: Partial<Contract>): Partial<ContractDB> {
    const db: Partial<ContractDB> = {};
    
    if (domain.proposalId !== undefined) db.proposal_id = domain.proposalId || null;
    if (domain.customerId) db.customer_id = domain.customerId;
    if (domain.motorcycleId) db.motorcycle_id = domain.motorcycleId;
    if (domain.rentalCompanyId) db.rental_company_id = domain.rentalCompanyId;
    if (domain.contractFile !== undefined) db.contract_file = domain.contractFile || null;
    if (domain.status) db.status = domain.status;
    if (domain.startDate) db.start_date = domain.startDate.toISOString().split('T')[0];
    if (domain.endDate) db.end_date = domain.endDate.toISOString().split('T')[0];
    if (domain.observations !== undefined) db.observations = domain.observations || null;
    
    return db;
  }
}
