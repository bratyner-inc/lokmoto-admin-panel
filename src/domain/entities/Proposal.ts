export type ProposalStatus = 
  | 'open' 
  | 'pending' 
  | 'answered_company' 
  | 'answered_customer' 
  | 'closed' 
  | 'accepted' 
  | 'rejected';

export interface Proposal {
  id: string;
  customerId: string;
  motorcycleId: string;
  rentalCompanyId: string;
  status: ProposalStatus;
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
