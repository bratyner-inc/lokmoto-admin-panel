// Ticket domain entity
export type TicketType = 'defect' | 'accident' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AttachmentType = 'document' | 'photo';

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  uploadedBy?: string | null;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  contractId: string;
  customerId: string;
  motorcycleId: string;
  ticketNumber: string;
  ticketType: TicketType;
  status: TicketStatus;
  title: string;
  description: string;
  priority: TicketPriority;
  assignedTo?: string | null;
  resolutionDetails?: string | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (populated when fetched with details)
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
  contract?: {
    id: string;
    contractNumber: string;
  };
  attachments?: TicketAttachment[];
}

export interface CreateTicketDTO {
  contractId: string;
  customerId: string;
  motorcycleId: string;
  ticketType: TicketType;
  priority: TicketPriority;
  title: string;
  description: string;
  status?: TicketStatus;
}

export interface UpdateTicketDTO {
  status?: TicketStatus;
  priority?: TicketPriority;
  title?: string;
  description?: string;
  assignedTo?: string;
  resolutionDetails?: string;
}

// For filters
export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  ticketType?: TicketType;
  contractId?: string;
  customerId?: string;
}

// Ticket with related data
export interface TicketWithDetails extends Ticket {
  customer: {
    id: string;
    fullName: string;
    email: string;
  };
  motorcycle: {
    id: string;
    brand: string;
    model: string;
    plate: string;
  };
  contract: {
    id: string;
    contractNumber: string;
  };
  attachments: TicketAttachment[];
}

