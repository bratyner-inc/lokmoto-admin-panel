// Domain entity for Customer
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentId: string; // CPF
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDTO {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
}

export interface UpdateCustomerDTO {
  fullName?: string;
  phone?: string;
}

