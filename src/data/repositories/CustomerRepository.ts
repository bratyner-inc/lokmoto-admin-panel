import { supabase } from '@/infrastructure/config/supabase';
import { 
  ICustomerRepository, 
  CustomerWithRentalCompany, 
  GlobalCustomerStats 
} from '@/domain/repositories/ICustomerRepository';
import { 
  Customer, 
  CustomerWithLicense,
  CreateCustomerDTO, 
  UpdateCustomerDTO,
  DriverLicense,
  CreateDriverLicenseDTO,
  UpdateDriverLicenseDTO
} from '@/domain/entities/Customer';
import { CustomerMapper, CustomerDB, DriverLicenseDB, CustomerWithLicenseDB } from '../mappers/CustomerMapper';

export class CustomerRepository implements ICustomerRepository {
  private readonly tableName = 'customers';
  private readonly licenseTableName = 'customer_driver_licenses';

  /**
   * Get all customers
   * Note: RLS will filter based on authenticated user
   */
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return CustomerMapper.toDomainArray(data as CustomerDB[]);
  }

  /**
   * Get a single customer by ID
   */
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    return CustomerMapper.toDomain(data as CustomerDB);
  }

  /**
   * Get a customer with driver license details
   */
  async getByIdWithLicense(id: string): Promise<CustomerWithLicense | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        customer_driver_licenses(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch customer with license: ${error.message}`);
    }

    return CustomerMapper.toDomainWithLicense(data as CustomerWithLicenseDB);
  }

  /**
   * Create a new customer
   */
  async create(customerData: CreateCustomerDTO): Promise<Customer> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        id: customerData.id,
        full_name: customerData.fullName,
        email: customerData.email,
        phone: customerData.phone,
        document_id: customerData.documentId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return CustomerMapper.toDomain(data as CustomerDB);
  }

  /**
   * Update an existing customer
   */
  async update(id: string, customerData: UpdateCustomerDTO): Promise<Customer> {
    const updateData: Partial<Record<string, unknown>> = {};
    
    if (customerData.fullName !== undefined) updateData.full_name = customerData.fullName;
    if (customerData.email !== undefined) updateData.email = customerData.email;
    if (customerData.phone !== undefined) updateData.phone = customerData.phone;
    if (customerData.documentId !== undefined) updateData.document_id = customerData.documentId;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return CustomerMapper.toDomain(data as CustomerDB);
  }

  /**
   * Delete a customer
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  /**
   * Search customers by name or email
   */
  async search(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,document_id.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return CustomerMapper.toDomainArray(data as CustomerDB[]);
  }

  // ========== Driver License Operations ==========

  /**
   * Get driver license for a customer
   */
  async getDriverLicense(customerId: string): Promise<DriverLicense | null> {
    const { data, error } = await supabase
      .from(this.licenseTableName)
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch driver license: ${error.message}`);
    }

    return CustomerMapper.driverLicenseToDomain(data as DriverLicenseDB);
  }

  /**
   * Create driver license for a customer
   */
  async createDriverLicense(licenseData: CreateDriverLicenseDTO): Promise<DriverLicense> {
    const { data, error } = await supabase
      .from(this.licenseTableName)
      .insert({
        customer_id: licenseData.customerId,
        license_number: licenseData.licenseNumber,
        category: licenseData.category,
        expiration_date: licenseData.expirationDate.toISOString().split('T')[0],
        issuing_state: licenseData.issuingState,
        issuing_date: licenseData.issuingDate.toISOString().split('T')[0],
        license_file: licenseData.licenseFile || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create driver license: ${error.message}`);
    }

    return CustomerMapper.driverLicenseToDomain(data as DriverLicenseDB);
  }

  /**
   * Update driver license
   */
  async updateDriverLicense(id: string, licenseData: UpdateDriverLicenseDTO): Promise<DriverLicense> {
    const updateData: Partial<Record<string, unknown>> = {};
    
    if (licenseData.licenseNumber !== undefined) updateData.license_number = licenseData.licenseNumber;
    if (licenseData.category !== undefined) updateData.category = licenseData.category;
    if (licenseData.expirationDate !== undefined) {
      updateData.expiration_date = licenseData.expirationDate.toISOString().split('T')[0];
    }
    if (licenseData.issuingState !== undefined) updateData.issuing_state = licenseData.issuingState;
    if (licenseData.issuingDate !== undefined) {
      updateData.issuing_date = licenseData.issuingDate.toISOString().split('T')[0];
    }
    if (licenseData.licenseFile !== undefined) updateData.license_file = licenseData.licenseFile;

    const { data, error } = await supabase
      .from(this.licenseTableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update driver license: ${error.message}`);
    }

    return CustomerMapper.driverLicenseToDomain(data as DriverLicenseDB);
  }

  /**
   * Delete driver license
   */
  async deleteDriverLicense(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.licenseTableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete driver license: ${error.message}`);
    }
  }

  // Global Admin Methods

  /**
   * Get all customers across all rental companies (Global Admin only)
   * Note: RLS policies ensure only platform_admins can access this
   */
  async getAllGlobal(): Promise<CustomerWithRentalCompany[]> {
    // Get customers with contract count
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        contracts(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch global customers: ${error.message}`);
    }

    // Map to CustomerWithRentalCompany
    return data.map(item => {
      const customer = CustomerMapper.toDomain(item as CustomerDB);
      const contractsCount = (item.contracts as any)?.[0]?.count || 0;
      
      return {
        ...customer,
        contractsCount,
      };
    });
  }

  /**
   * Suspend a customer (Global Admin only)
   */
  async suspendCustomer(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to suspend customer: ${error.message}`);
    }

    return CustomerMapper.toDomain(data as CustomerDB);
  }

  /**
   * Activate a customer (Global Admin only)
   */
  async activateCustomer(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to activate customer: ${error.message}`);
    }

    return CustomerMapper.toDomain(data as CustomerDB);
  }

  /**
   * Get global customer statistics (Global Admin only)
   */
  async getGlobalStats(): Promise<GlobalCustomerStats> {
    // Get customer count and active status
    const { data: customersData, error: customersError } = await supabase
      .from(this.tableName)
      .select('is_active');

    if (customersError) {
      throw new Error(`Failed to fetch customer stats: ${customersError.message}`);
    }

    // Get total contract count
    const { count: contractCount, error: contractError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });

    if (contractError) {
      throw new Error(`Failed to fetch contract count: ${contractError.message}`);
    }

    const total = customersData?.length || 0;
    const active = customersData?.filter(c => c.is_active !== false).length || 0;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
      totalContracts: contractCount || 0,
    };
  }
}

