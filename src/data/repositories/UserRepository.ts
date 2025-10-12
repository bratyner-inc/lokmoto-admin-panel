import { supabase } from '@/infrastructure/config/supabase';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '@/domain/entities/User';
import { UserRole } from '@/types';
import { UserMapper, PlatformAdminDB } from '../mappers/UserMapper';
import { RentalCompanyDB } from '../mappers/RentalCompanyMapper';

export class UserRepository implements IUserRepository {
  /**
   * Get all users (platform_admins + rental_companies)
   */
  async getAll(): Promise<User[]> {
    // Get platform admins
    const { data: admins, error: adminsError } = await supabase
      .from('platform_admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminsError) {
      throw new Error(`Failed to fetch platform admins: ${adminsError.message}`);
    }

    // Get rental companies (store admins)
    const { data: companies, error: companiesError } = await supabase
      .from('rental_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (companiesError) {
      throw new Error(`Failed to fetch rental companies: ${companiesError.message}`);
    }

    const adminUsers = (admins as PlatformAdminDB[]).map(UserMapper.platformAdminToDomain);
    const companyUsers = (companies as RentalCompanyDB[]).map(UserMapper.rentalCompanyToDomain);

    return [...adminUsers, ...companyUsers];
  }

  /**
   * Get a single user by ID
   */
  async getById(id: string): Promise<User | null> {
    // Try platform_admins first
    const { data: admin, error: adminError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('id', id)
      .single();

    if (!adminError && admin) {
      return UserMapper.platformAdminToDomain(admin as PlatformAdminDB);
    }

    // Try rental_companies
    const { data: company, error: companyError } = await supabase
      .from('rental_companies')
      .select('*')
      .eq('id', id)
      .single();

    if (!companyError && company) {
      return UserMapper.rentalCompanyToDomain(company as RentalCompanyDB);
    }

    return null;
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserDTO): Promise<User> {
    if (data.role === UserRole.GLOBAL_ADMIN) {
      return this.createPlatformAdmin(data);
    } else if (data.role === UserRole.STORE_ADMIN) {
      return this.createStoreAdmin(data);
    } else {
      throw new Error(`Unsupported role: ${data.role}`);
    }
  }

  /**
   * Create a platform admin
   */
  private async createPlatformAdmin(data: CreateUserDTO): Promise<User> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        role: 'global_admin',
        full_name: data.fullName,
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message || 'Unknown error'}`);
    }

    // Create platform_admin record
    const { data: admin, error: adminError } = await supabase
      .from('platform_admins')
      .insert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
      })
      .select()
      .single();

    if (adminError) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create platform admin: ${adminError.message}`);
    }

    return UserMapper.platformAdminToDomain(admin as PlatformAdminDB);
  }

  /**
   * Create a store admin (rental company)
   */
  private async createStoreAdmin(data: CreateUserDTO): Promise<User> {
    if (!data.tradingName || !data.companyName || !data.cnpj) {
      throw new Error('Trading name, company name, and CNPJ are required for store admins');
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        role: 'store_admin',
        company_name: data.companyName,
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message || 'Unknown error'}`);
    }

    // Create rental_company record
    const { data: company, error: companyError } = await supabase
      .from('rental_companies')
      .insert({
        id: authData.user.id,
        trading_name: data.tradingName,
        company_name: data.companyName,
        email: data.email,
        phone: data.phone || '',
        cnpj: data.cnpj,
        subscription_status: 'pending',
      })
      .select()
      .single();

    if (companyError) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create rental company: ${companyError.message}`);
    }

    return UserMapper.rentalCompanyToDomain(company as RentalCompanyDB);
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === UserRole.GLOBAL_ADMIN) {
      const { data: updated, error } = await supabase
        .from('platform_admins')
        .update({
          full_name: data.fullName,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update platform admin: ${error.message}`);
      }

      return UserMapper.platformAdminToDomain(updated as PlatformAdminDB);
    } else {
      const updateData: any = {};
      if (data.fullName) updateData.company_name = data.fullName;
      if (data.phone) updateData.phone = data.phone;

      const { data: updated, error } = await supabase
        .from('rental_companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update rental company: ${error.message}`);
      }

      return UserMapper.rentalCompanyToDomain(updated as RentalCompanyDB);
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    // Delete from auth (will cascade to platform_admins or rental_companies)
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Toggle user active status
   */
  async toggleActive(id: string): Promise<User> {
    const user = await this.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === UserRole.STORE_ADMIN) {
      const newStatus = user.isActive ? 'inactive' : 'active';
      
      const { data: updated, error } = await supabase
        .from('rental_companies')
        .update({ subscription_status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to toggle user status: ${error.message}`);
      }

      return UserMapper.rentalCompanyToDomain(updated as RentalCompanyDB);
    } else {
      // Platform admins cannot be deactivated for now
      return user;
    }
  }
}


