import { supabase } from '@/infrastructure/config/supabase';
import { IRentalCompanyRepository, SubscriptionStatus, RentalCompanyStats } from '@/domain/repositories/IRentalCompanyRepository';
import { RentalCompany, CreateRentalCompanyDTO, UpdateRentalCompanyDTO, UpdateRentalCompanyProfileDTO } from '@/domain/entities/RentalCompany';
import { RentalCompanyMapper, RentalCompanyDB } from '../mappers/RentalCompanyMapper';
import { AddressRepository } from './AddressRepository';

export class RentalCompanyRepository implements IRentalCompanyRepository {
  private readonly tableName = 'rental_companies';
  private addressRepository = new AddressRepository();

  /**
   * Get all rental companies with addresses (polimórfico)
   */
  async getAll(): Promise<RentalCompany[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        addresses!inner(*)
      `)
      .eq('addresses.owner_type', 'rental_company')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch rental companies: ${error.message}`);
    }

    return (data as any[]).map(RentalCompanyMapper.toDomain);
  }

  /**
   * Get rental company by ID with address (polimórfico)
   */
  async getById(id: string): Promise<RentalCompany | null> {
    // Buscar rental company
    const { data: companyData, error: companyError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (companyError) {
      if (companyError.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch rental company: ${companyError.message}`);
    }

    // Buscar endereço associado (polimórfico)
    const { data: addressData } = await supabase
      .from('addresses')
      .select('*')
      .eq('owner_type', 'rental_company')
      .eq('owner_id', id)
      .maybeSingle();

    // Combinar dados
    const combined = {
      ...companyData,
      addresses: addressData || undefined,
    };

    return RentalCompanyMapper.toDomain(combined as RentalCompanyDB);
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

  /**
   * Update rental company profile (Configurações)
   * Only editable fields: companyName, phone, address (object), logoUrl
   */
  async updateProfile(id: string, data: UpdateRentalCompanyProfileDTO): Promise<RentalCompany> {
    // 1. Atualizar rental company
    const updateData: Partial<RentalCompanyDB> = {};

    if (data.companyName !== undefined) updateData.company_name = data.companyName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl || null;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
    }

    // 2. Atualizar ou criar endereço se fornecido (polimórfico)
    if (data.address) {
      // Buscar endereço existente
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('owner_type', 'rental_company')
        .eq('owner_id', id)
        .single();

      if (existingAddress) {
        // Atualizar endereço existente
        await this.addressRepository.update(existingAddress.id, data.address);
      } else {
        // Criar novo endereço
        await this.addressRepository.create(data.address, 'rental_company', id);
      }
    }

    // 3. Retornar rental company atualizado
    return (await this.getById(id))!;
  }

  /**
   * Upload company logo to storage
   * @param rentalCompanyId ID of the rental company
   * @param file Logo file to upload
   * @returns Public URL of the uploaded logo
   */
  async uploadLogo(rentalCompanyId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${rentalCompanyId}/logo.${fileExt}`;

    // Upload file to storage bucket
    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload logo: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage.from('company-logos').getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * Complete onboarding step
   * @param id Rental company ID
   * @param step Step number (0-4)
   */
  async completeOnboardingStep(id: string, step: number): Promise<RentalCompany> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ onboarding_step: step })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update onboarding step: ${error.message}`);
    }

    return RentalCompanyMapper.toDomain(data as RentalCompanyDB);
  }

  /**
   * Complete onboarding process
   * Marks onboarding as completed and sets step to 4
   */
  async completeOnboarding(id: string): Promise<RentalCompany> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        onboarding_completed: true,
        onboarding_step: 4,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete onboarding: ${error.message}`);
    }

    return RentalCompanyMapper.toDomain(data as RentalCompanyDB);
  }
}


