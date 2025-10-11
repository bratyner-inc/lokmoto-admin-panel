import { supabase } from '@/infrastructure/config/supabase';
import { ITicketRepository } from '@/domain/repositories/ITicketRepository';
import { 
  Ticket, 
  TicketWithDetails,
  CreateTicketDTO, 
  UpdateTicketDTO,
  TicketStatus,
  TicketPriority,
  TicketAttachment,
  CreateTicketAttachmentDTO
} from '@/domain/entities/Ticket';
import { TicketMapper, TicketDB, TicketWithDetailsDB, TicketAttachmentDB } from '../mappers/TicketMapper';

export class TicketRepository implements ITicketRepository {
  private readonly tableName = 'tickets';
  private readonly attachmentsTableName = 'ticket_attachments';

  /**
   * Get all tickets for the authenticated user
   */
  async getAll(): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }

    return TicketMapper.toDomainArray(data as TicketDB[]);
  }

  /**
   * Get a single ticket by ID
   */
  async getById(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch ticket: ${error.message}`);
    }

    return TicketMapper.toDomain(data as TicketDB);
  }

  /**
   * Get a ticket with full details
   */
  async getByIdWithDetails(id: string): Promise<TicketWithDetails | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        contracts!tickets_contract_id_fkey(id, contract_number, status),
        customers(id, full_name, email, phone),
        rental_companies(id, company_name, email),
        ticket_attachments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch ticket with details: ${error.message}`);
    }

    return TicketMapper.toDomainWithDetails(data as TicketWithDetailsDB);
  }

  /**
   * Create a new ticket
   */
  async create(data: CreateTicketDTO): Promise<Ticket> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert({
        contract_id: data.contractId,
        customer_id: data.customerId,
        rental_company_id: data.rentalCompanyId,
        ticket_type: data.ticketType,
        priority: data.priority,
        title: data.title,
        description: data.description,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }

    return TicketMapper.toDomain(result as TicketDB);
  }

  /**
   * Update an existing ticket
   */
  async update(id: string, data: UpdateTicketDTO): Promise<Ticket> {
    const updateData: Partial<Record<string, unknown>> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;
    if (data.resolution !== undefined) updateData.resolution = data.resolution;
    if (data.resolvedAt !== undefined) updateData.resolved_at = data.resolvedAt?.toISOString();

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }

    return TicketMapper.toDomain(result as TicketDB);
  }

  /**
   * Delete a ticket
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ticket: ${error.message}`);
    }
  }

  /**
   * Get tickets by contract ID
   */
  async getByContractId(contractId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tickets by contract: ${error.message}`);
    }

    return TicketMapper.toDomainArray(data as TicketDB[]);
  }

  /**
   * Get tickets by customer ID
   */
  async getByCustomerId(customerId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tickets by customer: ${error.message}`);
    }

    return TicketMapper.toDomainArray(data as TicketDB[]);
  }

  /**
   * Get tickets by status
   */
  async getByStatus(status: TicketStatus): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false});

    if (error) {
      throw new Error(`Failed to fetch tickets by status: ${error.message}`);
    }

    return TicketMapper.toDomainArray(data as TicketDB[]);
  }

  /**
   * Get tickets by priority
   */
  async getByPriority(priority: TicketPriority): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tickets by priority: ${error.message}`);
    }

    return TicketMapper.toDomainArray(data as TicketDB[]);
  }

  /**
   * Close a ticket with resolution
   */
  async closeTicket(id: string, resolution: string): Promise<Ticket> {
    return this.update(id, {
      status: 'closed',
      resolution,
      resolvedAt: new Date(),
    });
  }

  /**
   * Assign a ticket to a platform admin
   */
  async assignTicket(id: string, adminId: string): Promise<Ticket> {
    return this.update(id, {
      assignedTo: adminId,
      status: 'in_progress',
    });
  }

  // ========== Attachment Operations ==========

  /**
   * Get all attachments for a ticket
   */
  async getAttachments(ticketId: string): Promise<TicketAttachment[]> {
    const { data, error } = await supabase
      .from(this.attachmentsTableName)
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch attachments: ${error.message}`);
    }

    return TicketMapper.attachmentToDomainArray(data as TicketAttachmentDB[]);
  }

  /**
   * Add an attachment to a ticket
   */
  async addAttachment(data: CreateTicketAttachmentDTO): Promise<TicketAttachment> {
    const { data: result, error } = await supabase
      .from(this.attachmentsTableName)
      .insert({
        ticket_id: data.ticketId,
        file_type: data.fileType,
        file_name: data.fileName,
        file_url: data.fileUrl,
        file_size: data.fileSize || null,
        mime_type: data.mimeType || null,
        uploaded_by: data.uploadedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add attachment: ${error.message}`);
    }

    return TicketMapper.attachmentToDomain(result as TicketAttachmentDB);
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachmentId: string): Promise<void> {
    const { error } = await supabase
      .from(this.attachmentsTableName)
      .delete()
      .eq('id', attachmentId);

    if (error) {
      throw new Error(`Failed to delete attachment: ${error.message}`);
    }
  }

  /**
   * Count attachments by type for a ticket
   */
  async countAttachmentsByType(ticketId: string): Promise<{ documents: number; photos: number }> {
    const { data, error } = await supabase
      .from(this.attachmentsTableName)
      .select('file_type')
      .eq('ticket_id', ticketId);

    if (error) {
      throw new Error(`Failed to count attachments: ${error.message}`);
    }

    const documents = data.filter(att => att.file_type === 'document').length;
    const photos = data.filter(att => att.file_type === 'photo').length;

    return { documents, photos };
  }
}

