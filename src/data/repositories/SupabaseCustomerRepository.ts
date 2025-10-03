import { supabase } from '@/integrations/supabase/client';
import { ICustomerRepository } from '@/domain/interfaces/ICustomerRepository';
import { Customer, CustomerDriverLicense } from '@/domain/entities/Customer';
import { CustomerMapper } from '@/data/mappers/CustomerMapper';

export class SupabaseCustomerRepository implements ICustomerRepository {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data.map(CustomerMapper.toDomain);
  }
  
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw new Error(error.message);
    return data ? CustomerMapper.toDomain(data) : null;
  }
  
  async create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        id: customer.id,
        full_name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        document_id: customer.documentId,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return CustomerMapper.toDomain(data);
  }
  
  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(CustomerMapper.toDatabase(customer))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return CustomerMapper.toDomain(data);
  }
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
  
  async getLicenses(customerId: string): Promise<CustomerDriverLicense[]> {
    const { data, error } = await supabase
      .from('customer_driver_licenses')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data.map(license => ({
      id: license.id,
      customerId: license.customer_id,
      licenseNumber: license.license_number,
      category: license.category,
      expirationDate: new Date(license.expiration_date),
      issuingState: license.issuing_state,
      issuingDate: new Date(license.issuing_date),
      licenseFile: license.license_file,
      createdAt: new Date(license.created_at),
      updatedAt: new Date(license.updated_at),
    }));
  }
  
  async addLicense(license: Omit<CustomerDriverLicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerDriverLicense> {
    const { data, error } = await supabase
      .from('customer_driver_licenses')
      .insert({
        customer_id: license.customerId,
        license_number: license.licenseNumber,
        category: license.category,
        expiration_date: license.expirationDate.toISOString(),
        issuing_state: license.issuingState,
        issuing_date: license.issuingDate.toISOString(),
        license_file: license.licenseFile,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      customerId: data.customer_id,
      licenseNumber: data.license_number,
      category: data.category,
      expirationDate: new Date(data.expiration_date),
      issuingState: data.issuing_state,
      issuingDate: new Date(data.issuing_date),
      licenseFile: data.license_file,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
  
  async updateLicense(id: string, license: Partial<CustomerDriverLicense>): Promise<CustomerDriverLicense> {
    const updateData: any = {};
    if (license.licenseNumber) updateData.license_number = license.licenseNumber;
    if (license.category) updateData.category = license.category;
    if (license.expirationDate) updateData.expiration_date = license.expirationDate.toISOString();
    if (license.issuingState) updateData.issuing_state = license.issuingState;
    if (license.issuingDate) updateData.issuing_date = license.issuingDate.toISOString();
    if (license.licenseFile !== undefined) updateData.license_file = license.licenseFile;
    
    const { data, error } = await supabase
      .from('customer_driver_licenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      customerId: data.customer_id,
      licenseNumber: data.license_number,
      category: data.category,
      expirationDate: new Date(data.expiration_date),
      issuingState: data.issuing_state,
      issuingDate: new Date(data.issuing_date),
      licenseFile: data.license_file,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
  
  async deleteLicense(id: string): Promise<void> {
    const { error } = await supabase
      .from('customer_driver_licenses')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
}
