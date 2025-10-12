import { Customer, CustomerWithLicense, DriverLicense } from '@/domain/entities/Customer';

// Database representation of a customer
export interface CustomerDB {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document_id: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// Database representation of a driver license
export interface DriverLicenseDB {
  id: string;
  customer_id: string;
  license_number: string;
  category: string;
  expiration_date: string;
  issuing_state: string;
  issuing_date: string;
  license_file: string | null;
  created_at: string;
  updated_at: string;
}

// Customer with joined driver license
export interface CustomerWithLicenseDB extends CustomerDB {
  customer_driver_licenses?: DriverLicenseDB[];
}

export class CustomerMapper {
  /**
   * Map from database representation to domain entity
   */
  static toDomain(raw: CustomerDB): Customer {
    return {
      id: raw.id,
      fullName: raw.full_name,
      email: raw.email,
      phone: raw.phone,
      documentId: raw.document_id,
      isActive: raw.is_active,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Map driver license from database to domain
   */
  static driverLicenseToDomain(raw: DriverLicenseDB): DriverLicense {
    return {
      id: raw.id,
      customerId: raw.customer_id,
      licenseNumber: raw.license_number,
      category: raw.category,
      expirationDate: new Date(raw.expiration_date),
      issuingState: raw.issuing_state,
      issuingDate: new Date(raw.issuing_date),
      licenseFile: raw.license_file || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  /**
   * Map customer with driver license from database to domain
   */
  static toDomainWithLicense(raw: CustomerWithLicenseDB): CustomerWithLicense {
    const customer = this.toDomain(raw);
    
    return {
      ...customer,
      driverLicense: raw.customer_driver_licenses && raw.customer_driver_licenses.length > 0
        ? this.driverLicenseToDomain(raw.customer_driver_licenses[0])
        : undefined,
    };
  }

  /**
   * Map an array of database records to domain entities
   */
  static toDomainArray(rawArray: CustomerDB[]): Customer[] {
    return rawArray.map(raw => this.toDomain(raw));
  }

  /**
   * Map an array of driver licenses to domain
   */
  static driverLicenseToDomainArray(rawArray: DriverLicenseDB[]): DriverLicense[] {
    return rawArray.map(raw => this.driverLicenseToDomain(raw));
  }
}

