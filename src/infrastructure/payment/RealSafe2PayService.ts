import { ISafe2PayService } from './ISafe2PayService';
import { Safe2PayPlanAPI, Safe2PayPlansResponse } from '@/domain/entities/Safe2PayPlan';

const SAFE2PAY_API_KEY = import.meta.env.VITE_SAFE2PAY_API_KEY || 'FD983FC0592D42A78E4B5B8D8126DFEA';
const SAFE2PAY_BASE_URL = import.meta.env.VITE_SAFE2PAY_BASE_URL || 'https://services.safe2pay.com.br';

export class RealSafe2PayService implements ISafe2PayService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = SAFE2PAY_API_KEY;
    this.baseUrl = SAFE2PAY_BASE_URL;
  }

  /**
   * Fetch plans from Safe2Pay API
   * Endpoint: GET /recurrence/v1/plans/
   */
  async fetchPlans(): Promise<Safe2PayPlanAPI[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recurrence/v1/plans/`, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Safe2Pay API error: ${response.status} - ${errorText}`);
      }

      const data: Safe2PayPlansResponse = await response.json();

      if (!data.success) {
        throw new Error('Safe2Pay API returned success: false');
      }

      return data.data.objects;
    } catch (error) {
      console.error('Error fetching Safe2Pay plans:', error);
      throw new Error(`Failed to fetch plans from Safe2Pay: ${(error as Error).message}`);
    }
  }

  /**
   * Create a subscription (not implemented in Fase 1)
   */
  async createSubscription(/* params */): Promise<any> {
    throw new Error('createSubscription not implemented in Fase 1');
  }

  /**
   * Process payment (not implemented in Fase 1)
   */
  async processPayment(/* params */): Promise<any> {
    throw new Error('processPayment not implemented in Fase 1');
  }
}


