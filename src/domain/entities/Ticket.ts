export type TicketType = 'defect' | 'accident' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'closed';

export interface Ticket {
  id: string;
  contractId: string;
  customerId: string;
  rentalCompanyId: string;
  type: TicketType;
  description: string;
  occurrenceDate: Date;
  location?: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}
