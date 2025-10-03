import { Customer } from '@/domain/entities/Customer';

interface CustomerDB {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document_id: string;
  created_at: string;
  updated_at: string;
}

export class CustomerMapper {
  static toDomain(raw: CustomerDB): Customer {
    return {
      id: raw.id,
      fullName: raw.full_name,
      email: raw.email,
      phone: raw.phone,
      documentId: raw.document_id,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  static toDatabase(domain: Partial<Customer>): Partial<CustomerDB> {
    return {
      ...(domain.fullName && { full_name: domain.fullName }),
      ...(domain.email && { email: domain.email }),
      ...(domain.phone && { phone: domain.phone }),
      ...(domain.documentId && { document_id: domain.documentId }),
    };
  }
}
