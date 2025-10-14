import { 
  Ticket, 
  TicketWithDetails,
  CreateTicketDTO, 
  UpdateTicketDTO,
  TicketStatus,
  TicketPriority,
  TicketAttachment
} from '../entities/Ticket';

export interface ITicketRepository {
  /**
   * Get all tickets for the authenticated user
   * (rental company or customer)
   */
  getAll(): Promise<Ticket[]>;

  /**
   * Get a single ticket by ID
   */
  getById(id: string): Promise<Ticket | null>;

  /**
   * Get a ticket with full details (contract, customer, attachments, etc.)
   */
  getByIdWithDetails(id: string): Promise<TicketWithDetails | null>;

  /**
   * Create a new ticket
   */
  create(data: CreateTicketDTO): Promise<Ticket>;

  /**
   * Update an existing ticket
   */
  update(id: string, data: UpdateTicketDTO): Promise<Ticket>;

  /**
   * Delete a ticket
   */
  delete(id: string): Promise<void>;

  /**
   * Get tickets by contract ID
   */
  getByContractId(contractId: string): Promise<Ticket[]>;

  /**
   * Get tickets by customer ID
   */
  getByCustomerId(customerId: string): Promise<Ticket[]>;

  /**
   * Get tickets by status
   */
  getByStatus(status: TicketStatus): Promise<Ticket[]>;

  /**
   * Get tickets by priority
   */
  getByPriority(priority: TicketPriority): Promise<Ticket[]>;

  /**
   * Close a ticket with resolution
   */
  closeTicket(id: string, resolution: string): Promise<Ticket>;

  /**
   * Assign a ticket to a platform admin
   */
  assignTicket(id: string, adminId: string): Promise<Ticket>;

  // Attachment operations

  /**
   * Get all attachments for a ticket
   */
  getAttachments(ticketId: string): Promise<TicketAttachment[]>;

  /**
   * Add an attachment to a ticket
   */
  addAttachment(ticketId: string, file: File): Promise<TicketAttachment>;

  /**
   * Delete an attachment
   */
  deleteAttachment(attachmentId: string): Promise<void>;

  /**
   * Count attachments by type for a ticket
   */
  countAttachmentsByType(ticketId: string): Promise<{ documents: number; photos: number }>;

  /**
   * Get ticket statistics by rental company
   */
  getTicketStats(rentalCompanyId: string): Promise<{ open: number; inProgress: number; closed: number; total: number; }>;
}

