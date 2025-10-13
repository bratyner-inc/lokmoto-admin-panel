import { Ticket, TicketWithDetails, TicketAttachment } from '@/domain/entities/Ticket';

// Database representation of a ticket
export interface TicketDB {
  id: string;
  contract_id: string;
  customer_id: string;
  rental_company_id: string;
  ticket_type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Database representation of attachment
export interface TicketAttachmentDB {
  id: string;
  ticket_id: string;
  file_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}

// Ticket with joined details
export interface TicketWithDetailsDB extends TicketDB {
  contracts?: {
    id: string;
    contract_number: string;
    status: string;
  };
  customers?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  rental_companies?: {
    id: string;
    company_name: string;
    email: string;
  };
  ticket_attachments?: TicketAttachmentDB[];
}

export class TicketMapper {
  /**
   * Map from database representation to domain entity
   */
  static toDomain(raw: TicketDB): Ticket {
    return {
      id: raw.id,
      contractId: raw.contract_id,
      customerId: raw.customer_id,
      rentalCompanyId: raw.rental_company_id,
      ticketType: raw.ticket_type as 'defect' | 'accident' | 'other',
      status: raw.status as 'open' | 'in_progress' | 'closed',
      priority: raw.priority as 'low' | 'medium' | 'high' | 'urgent',
      title: raw.title,
      description: raw.description,
      assignedTo: raw.assigned_to || undefined,
      resolution: raw.resolution || undefined,
      resolvedAt: raw.resolved_at ? new Date(raw.resolved_at) : undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Map attachment from database to domain
   */
  static attachmentToDomain(raw: TicketAttachmentDB): TicketAttachment {
    return {
      id: raw.id,
      ticketId: raw.ticket_id,
      fileType: raw.file_type as 'document' | 'photo',
      fileName: raw.file_name,
      fileUrl: raw.file_url,
      fileSize: raw.file_size || undefined,
      mimeType: raw.mime_type || undefined,
      uploadedBy: raw.uploaded_by,
      createdAt: new Date(raw.created_at),
    };
  }

  /**
   * Map ticket with details from database to domain
   */
  static toDomainWithDetails(raw: TicketWithDetailsDB): TicketWithDetails {
    const ticket = this.toDomain(raw);
    
    return {
      ...ticket,
      contract: raw.contracts ? {
        id: raw.contracts.id,
        contractNumber: raw.contracts.contract_number,
        status: raw.contracts.status,
      } : undefined,
      customer: raw.customers ? {
        id: raw.customers.id,
        name: raw.customers.full_name,
        email: raw.customers.email,
        phone: raw.customers.phone,
      } : undefined,
      rentalCompany: raw.rental_companies ? {
        id: raw.rental_companies.id,
        name: raw.rental_companies.company_name,
        email: raw.rental_companies.email,
      } : undefined,
      attachments: raw.ticket_attachments 
        ? raw.ticket_attachments.map(att => this.attachmentToDomain(att))
        : undefined,
    };
  }

  /**
   * Map an array of database records to domain entities
   */
  static toDomainArray(rawArray: TicketDB[]): Ticket[] {
    return rawArray.map(raw => this.toDomain(raw));
  }

  /**
   * Map an array of attachments to domain
   */
  static attachmentToDomainArray(rawArray: TicketAttachmentDB[]): TicketAttachment[] {
    return rawArray.map(raw => this.attachmentToDomain(raw));
  }
}

