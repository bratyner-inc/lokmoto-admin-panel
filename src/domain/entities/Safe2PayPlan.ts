// Safe2Pay Plan entity
export interface Safe2PayPlan {
  idPlan: number;
  name: string;
  subscriptionLimit: number;
  quantitySubscription: number;
  amount: number;
  frequence: string; // "Mensal", "Quinzenal", etc
  isActive?: boolean;
  syncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response from Safe2Pay
export interface Safe2PayPlansResponse {
  success: boolean;
  data: {
    objects: Safe2PayPlanAPI[];
    totalItems: number;
  };
}

export interface Safe2PayPlanAPI {
  idPlan: number;
  name: string;
  subscriptionLimit: number;
  quantitySubscription: number;
  amount: number;
  frequence: string;
}


