// Customer domain entity
export interface Customer {
  id: string; // References auth.users(id)
  fullName: string;
  email: string;
  phone: string;
  documentId: string; // CPF
  isActive?: boolean; // For suspension/activation (Global Admin)
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDTO {
  id: string; // Must be a valid auth.users ID
  fullName: string;
  email: string;
  phone: string;
  documentId: string; // CPF
}

export interface UpdateCustomerDTO {
  fullName?: string;
  email?: string;
  phone?: string;
  documentId?: string;
}

// Driver License entity
export interface DriverLicense {
  id: string;
  customerId: string;
  licenseNumber: string;
  category: string; // A, B, AB, etc.
  expirationDate: Date;
  issuingState: string;
  issuingDate: Date;
  licenseFile?: string; // Storage path
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDriverLicenseDTO {
  customerId: string;
  licenseNumber: string;
  category: string;
  expirationDate: Date;
  issuingState: string;
  issuingDate: Date;
  licenseFile?: string;
}

export interface UpdateDriverLicenseDTO {
  licenseNumber?: string;
  category?: string;
  expirationDate?: Date;
  issuingState?: string;
  issuingDate?: Date;
  licenseFile?: string;
}

// Customer with driver license details
export interface CustomerWithLicense extends Customer {
  driverLicense?: DriverLicense;
}
