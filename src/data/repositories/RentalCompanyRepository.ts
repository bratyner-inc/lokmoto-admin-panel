import { supabase } from '@/infrastructure/config/supabase';
import { IRentalCompanyRepository, SubscriptionStatus, RentalCompanyStats } from '@/domain/repositories/IRentalCompanyRepository';
import { RentalCompany, CreateRentalCompanyDTO, UpdateRentalCompanyDTO } from '@/domain/entities/RentalCompany';
import { RentalCompanyMapper, RentalCompanyDB } from '../mappers/RentalCompanyMapper';

export class RentalCompanyRepository implements IRentalCompanyRepository {
  private readonly tableName = 'rental_companies';

  /**
   * Get all rental companies
   */
  async getAll(): Promise<RentalCompany[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch rental companies: ${error.message}`);
    }

    return (data as RentalCompanyDB[]).map(RentalCompanyMapper.toDomain);
  }

  /**
   * Get rental company by ID
   */
  async getById(id: string): Promise<RentalCompany | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch rental company: ${error.message}`);
    }

    return RentalCompanyMapper.toDomain(data as RentalCompanyDB);
  }

  /**
   * Create a new rental company
   * Also creates the user in Supabase Auth
   */
  async create(data: CreateRentalCompanyDTO, password: string): Promise<RentalCompany> {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: 'store_admin',
          companyName: data.companyName,
        },
      });

      if (authError || !authData.user) {
        throw new Error(`Failed to create auth user: ${authError?.message || 'Unknown error'}`);
      }

      // 2. Create rental company record
      const companyData = {
        id: authData.user.id,
        ...RentalCompanyMapper.toCreateDB(data),
      };

      const { data: companyRecord, error: companyError } = await supabase
        .from(this.tableName)
        .insert(companyData)
        .select()
        .single();

      if (companyError) {
        // Rollback: delete the auth user if company creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Failed to create rental company: ${companyError.message}`);
      }

      return RentalCompanyMapper.toDomain(companyRecord as RentalCompanyDB);
    } catch (error) {
      console.error('Error creating rental company:', error);
      throw new Error(`Failed to create rental company: ${(error as Error).message}`);
    }
  }

  /**
   * Update rental company
   */
  async update(id: string, data: UpdateRentalCompanyDTO): Promise<RentalCompany> {
    const updateData = RentalCompanyMapper.toUpdateDB(data);

    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update rental company: ${error.message}`);
    }

    return RentalCompanyMapper.toDomain(updated as RentalCompanyDB);
  }

  /**
   * Delete rental company
   * This will also delete the auth user due to CASCADE
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete rental company: ${error.message}`);
    }
  }

  /**
   * Get rental companies by subscription status
   */
  async getByStatus(status: SubscriptionStatus): Promise<RentalCompany[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('subscription_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch rental companies by status: ${error.message}`);
    }

    return (data as RentalCompanyDB[]).map(RentalCompanyMapper.toDomain);
  }

  /**
   * Get rental companies with expiring subscriptions
   * @param days Number of days ahead to check for expiration
   */
  async getExpiringSubscriptions(days: number): Promise<RentalCompany[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('subscription_status', 'active')
      .not('subscription_expiration', 'is', null)
      .lte('subscription_expiration', futureDate.toISOString())
      .order('subscription_expiration', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch expiring subscriptions: ${error.message}`);
    }

    return (data as RentalCompanyDB[]).map(RentalCompanyMapper.toDomain);
  }

  /**
   * Get rental company statistics
   */
  async getStats(): Promise<RentalCompanyStats> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('subscription_status');

    if (error) {
      throw new Error(`Failed to fetch rental company stats: ${error.message}`);
    }

    const expiringCompanies = await this.getExpiringSubscriptions(7);

    const stats: RentalCompanyStats = {
      total: data.length,
      active: data.filter(r => r.subscription_status === 'active').length,
      inactive: data.filter(r => r.subscription_status === 'inactive').length,
      pending: data.filter(r => r.subscription_status === 'pending').length,
      canceled: data.filter(r => r.subscription_status === 'canceled').length,
      expiringIn7Days: expiringCompanies.length,
    };

    return stats;
  }

  /**
   * Suspend (deactivate) a rental company
   */
  async suspendCompany(id: string): Promise<RentalCompany> {
    return this.update(id, { subscriptionStatus: 'inactive' });
  }

  /**
   * Activate a rental company
   */
  async activateCompany(id: string): Promise<RentalCompany> {
    return this.update(id, { subscriptionStatus: 'active' });
  }
}


