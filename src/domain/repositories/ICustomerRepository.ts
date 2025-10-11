import { 
  Customer, 
  CustomerWithLicense,
  CreateCustomerDTO, 
  UpdateCustomerDTO,
  DriverLicense,
  CreateDriverLicenseDTO,
  UpdateDriverLicenseDTO
} from '../entities/Customer';

export interface ICustomerRepository {
  /**
   * Get all customers for the authenticated rental company
   */
  getAll(): Promise<Customer[]>;

  /**
   * Get a single customer by ID
   */
  getById(id: string): Promise<Customer | null>;

  /**
   * Get a customer with driver license details
   */
  getByIdWithLicense(id: string): Promise<CustomerWithLicense | null>;

  /**
   * Create a new customer
   */
  create(data: CreateCustomerDTO): Promise<Customer>;

  /**
   * Update an existing customer
   */
  update(id: string, data: UpdateCustomerDTO): Promise<Customer>;

  /**
   * Delete a customer
   */
  delete(id: string): Promise<void>;

  /**
   * Search customers by name or email
   */
  search(query: string): Promise<Customer[]>;

  // Driver License operations
  
  /**
   * Get driver license for a customer
   */
  getDriverLicense(customerId: string): Promise<DriverLicense | null>;

  /**
   * Create driver license for a customer
   */
  createDriverLicense(data: CreateDriverLicenseDTO): Promise<DriverLicense>;

  /**
   * Update driver license
   */
  updateDriverLicense(id: string, data: UpdateDriverLicenseDTO): Promise<DriverLicense>;

  /**
   * Delete driver license
   */
  deleteDriverLicense(id: string): Promise<void>;
}

