import { Contract, ContractStatus, ContractWithDetails } from '@/domain/entities/Contract';

// Database representation of a contract
export interface ContractDB {
  id: string;
  contract_number: string;
  rental_company_id: string;
  customer_id: string;
  proposal_id: string;
  motorcycle_id: string;
  start_date: string;
  end_date: string | null;
  monthly_value: number;
  payment_day: number;
  status: ContractStatus;
  cancellation_date: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Database representation with related entities
export interface ContractWithDetailsDB extends ContractDB {
  customers?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  motorcycles?: {
    id: string;
    brand: string;
    model: string;
    version: string;
    year: number;
    plate: string;
  };
  proposals?: {
    id: string;
    proposal_number: string;
    status: string;
  };
}

export class ContractMapper {
  /**
   * Map from database representation to domain entity
   */
  static toDomain(raw: ContractDB): Contract {
    return {
      id: raw.id,
      contractNumber: raw.contract_number,
      rentalCompanyId: raw.rental_company_id,
      customerId: raw.customer_id,
      proposalId: raw.proposal_id,
      motorcycleId: raw.motorcycle_id,
      startDate: new Date(raw.start_date),
      endDate: raw.end_date ? new Date(raw.end_date) : null,
      monthlyValue: Number(raw.monthly_value),
      paymentDay: raw.payment_day,
      status: raw.status,
      cancellationDate: raw.cancellation_date ? new Date(raw.cancellation_date) : null,
      cancellationReason: raw.cancellation_reason,
      notes: raw.notes,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Map from database representation with details to domain entity with details
   */
  static toDomainWithDetails(raw: ContractWithDetailsDB): ContractWithDetails {
    const contract = this.toDomain(raw);
    
    return {
      ...contract,
      customer: raw.customers ? {
        id: raw.customers.id,
        name: raw.customers.full_name,
        email: raw.customers.email,
        phone: raw.customers.phone,
      } : undefined,
      motorcycle: raw.motorcycles ? {
        id: raw.motorcycles.id,
        brand: raw.motorcycles.brand,
        model: raw.motorcycles.model,
        version: raw.motorcycles.version,
        year: raw.motorcycles.year,
        plate: raw.motorcycles.plate,
      } : undefined,
      proposal: raw.proposals ? {
        id: raw.proposals.id,
        proposalNumber: raw.proposals.proposal_number,
        status: raw.proposals.status,
      } : undefined,
    };
  }

  /**
   * Map an array of database records to domain entities
   */
  static toDomainArray(rawArray: ContractDB[]): Contract[] {
    return rawArray.map(raw => this.toDomain(raw));
  }
}

