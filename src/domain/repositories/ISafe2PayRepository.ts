import { Safe2PayPlan } from '../entities/Safe2PayPlan';

export interface ISafe2PayRepository {
  // Get plans from local cache (Supabase)
  getPlans(): Promise<Safe2PayPlan[]>;
  getActivePlans(): Promise<Safe2PayPlan[]>;
  getPlanById(idPlan: number): Promise<Safe2PayPlan | null>;

  // Sync plans from Safe2Pay API to Supabase
  syncPlans(): Promise<Safe2PayPlan[]>;

  // Update plan status
  deactivatePlan(idPlan: number): Promise<void>;
  activatePlan(idPlan: number): Promise<void>;
}


