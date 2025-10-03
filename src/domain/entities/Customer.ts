export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentId: string; // CPF
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDriverLicense {
  id: string;
  customerId: string;
  licenseNumber: string;
  category: 'A' | 'B' | 'AB' | 'C' | 'D' | 'E';
  expirationDate: Date;
  issuingState: string;
  issuingDate: Date;
  licenseFile?: string;
  createdAt: Date;
  updatedAt: Date;
}
