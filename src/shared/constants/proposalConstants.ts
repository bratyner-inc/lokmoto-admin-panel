// Proposal-related constants

export const PROPOSAL_STATUS = {
  OPEN: 'open',
  PENDING: 'pending',
  ANSWERED_COMPANY: 'answered_company',
  ANSWERED_CUSTOMER: 'answered_customer',
  CLOSED: 'closed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const PROPOSAL_STATUS_LABELS = {
  [PROPOSAL_STATUS.OPEN]: 'Aberta',
  [PROPOSAL_STATUS.PENDING]: 'Pendente',
  [PROPOSAL_STATUS.ANSWERED_COMPANY]: 'Respondida pela Locadora',
  [PROPOSAL_STATUS.ANSWERED_CUSTOMER]: 'Respondida pelo Cliente',
  [PROPOSAL_STATUS.CLOSED]: 'Fechada',
  [PROPOSAL_STATUS.ACCEPTED]: 'Aceita',
  [PROPOSAL_STATUS.REJECTED]: 'Rejeitada',
};

export const PROPOSAL_STATUS_COLORS = {
  [PROPOSAL_STATUS.OPEN]: 'default',
  [PROPOSAL_STATUS.PENDING]: 'warning',
  [PROPOSAL_STATUS.ANSWERED_COMPANY]: 'info',
  [PROPOSAL_STATUS.ANSWERED_CUSTOMER]: 'info',
  [PROPOSAL_STATUS.CLOSED]: 'default',
  [PROPOSAL_STATUS.ACCEPTED]: 'success',
  [PROPOSAL_STATUS.REJECTED]: 'destructive',
} as const;

