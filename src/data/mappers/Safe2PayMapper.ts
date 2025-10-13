import { Safe2PayPlan, Safe2PayPlanAPI } from '@/domain/entities/Safe2PayPlan';

export interface Safe2PayPlanDB {
  id_plan: number;
  name: string;
  subscription_limit: number;
  quantity_subscription: number;
  amount: string; // numeric stored as string
  frequence: string;
  is_active: boolean;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export class Safe2PayMapper {
  static toDomain(db: Safe2PayPlanDB): Safe2PayPlan {
    return {
      idPlan: db.id_plan,
      name: db.name,
      subscriptionLimit: db.subscription_limit,
      quantitySubscription: db.quantity_subscription,
      amount: parseFloat(db.amount),
      frequence: db.frequence,
      isActive: db.is_active,
      syncedAt: new Date(db.synced_at),
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  static toDatabase(api: Safe2PayPlanAPI): Omit<Safe2PayPlanDB, 'synced_at' | 'created_at' | 'updated_at'> {
    return {
      id_plan: api.idPlan,
      name: api.name,
      subscription_limit: api.subscriptionLimit,
      quantity_subscription: api.quantitySubscription,
      amount: api.amount.toString(),
      frequence: api.frequence,
      is_active: true,
    };
  }

  static fromAPI(api: Safe2PayPlanAPI): Safe2PayPlan {
    return {
      idPlan: api.idPlan,
      name: api.name,
      subscriptionLimit: api.subscriptionLimit,
      quantitySubscription: api.quantitySubscription,
      amount: api.amount,
      frequence: api.frequence,
      isActive: true,
    };
  }
}


