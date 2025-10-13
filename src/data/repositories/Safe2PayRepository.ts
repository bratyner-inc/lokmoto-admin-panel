import { supabase } from '@/infrastructure/config/supabase';
import { ISafe2PayRepository } from '@/domain/repositories/ISafe2PayRepository';
import { Safe2PayPlan } from '@/domain/entities/Safe2PayPlan';
import { Safe2PayMapper, Safe2PayPlanDB } from '../mappers/Safe2PayMapper';
import { RealSafe2PayService } from '@/infrastructure/payment/RealSafe2PayService';

export class Safe2PayRepository implements ISafe2PayRepository {
  private readonly tableName = 'safe2pay_plans';
  private readonly safe2PayService = new RealSafe2PayService();

  /**
   * Get all plans from local cache (Supabase)
   */
  async getPlans(): Promise<Safe2PayPlan[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('is_active', { ascending: false })
      .order('amount', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch plans: ${error.message}`);
    }

    return (data as Safe2PayPlanDB[]).map(Safe2PayMapper.toDomain);
  }

  /**
   * Get only active plans
   */
  async getActivePlans(): Promise<Safe2PayPlan[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch active plans: ${error.message}`);
    }

    return (data as Safe2PayPlanDB[]).map(Safe2PayMapper.toDomain);
  }

  /**
   * Get plan by ID
   */
  async getPlanById(idPlan: number): Promise<Safe2PayPlan | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id_plan', idPlan)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch plan: ${error.message}`);
    }

    return Safe2PayMapper.toDomain(data as Safe2PayPlanDB);
  }

  /**
   * Sync plans from Safe2Pay API to Supabase
   * This fetches plans from Safe2Pay and upserts them into Supabase
   */
  async syncPlans(): Promise<Safe2PayPlan[]> {
    try {
      // Fetch plans from Safe2Pay API
      const apiPlans = await this.safe2PayService.fetchPlans();

      if (!apiPlans || apiPlans.length === 0) {
        throw new Error('No plans returned from Safe2Pay API');
      }

      // Convert API plans to database format
      const dbPlans = apiPlans.map(Safe2PayMapper.toDatabase);

      // Upsert plans into Supabase (insert or update if id_plan exists)
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(dbPlans, {
          onConflict: 'id_plan',
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        throw new Error(`Failed to sync plans to database: ${error.message}`);
      }

      return (data as Safe2PayPlanDB[]).map(Safe2PayMapper.toDomain);
    } catch (error) {
      console.error('Error syncing Safe2Pay plans:', error);
      throw new Error(`Failed to sync plans: ${(error as Error).message}`);
    }
  }

  /**
   * Deactivate a plan (soft delete)
   */
  async deactivatePlan(idPlan: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: false })
      .eq('id_plan', idPlan);

    if (error) {
      throw new Error(`Failed to deactivate plan: ${error.message}`);
    }
  }

  /**
   * Activate a plan
   */
  async activatePlan(idPlan: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: true })
      .eq('id_plan', idPlan);

    if (error) {
      throw new Error(`Failed to activate plan: ${error.message}`);
    }
  }
}


