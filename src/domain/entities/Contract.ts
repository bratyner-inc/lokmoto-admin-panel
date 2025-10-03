export type ContractStatus = 
  | 'active' 
  | 'pending_signature' 
  | 'pending_payment' 
  | 'canceled' 
  | 'expired' 
  | 'finished';

export interface Contract {
  id: string;
  proposalId?: string;
  customerId: string;
  motorcycleId: string;
  rentalCompanyId: string;
  contractFile?: string;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
