import { Customer, CustomerDriverLicense } from '../entities/Customer';

export interface ICustomerRepository {
  getAll(): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer>;
  update(id: string, customer: Partial<Customer>): Promise<Customer>;
  delete(id: string): Promise<void>;
  
  // Driver licenses
  getLicenses(customerId: string): Promise<CustomerDriverLicense[]>;
  addLicense(license: Omit<CustomerDriverLicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerDriverLicense>;
  updateLicense(id: string, license: Partial<CustomerDriverLicense>): Promise<CustomerDriverLicense>;
  deleteLicense(id: string): Promise<void>;
}
