import { ISafe2PayService } from './ISafe2PayService';
import { Safe2PayPaymentRequest, Safe2PayPaymentResponse } from '@/domain/entities/Transaction';

/**
 * Real Safe2Pay Service
 * Integrates with actual Safe2Pay API
 * 
 * TODO: Implement actual Safe2Pay API integration
 * Reference: https://developers.safe2pay.com.br/
 */
export class RealSafe2PayService implements ISafe2PayService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    // Get credentials from environment variables
    this.apiUrl = import.meta.env.VITE_SAFE2PAY_API_URL || 'https://api.safe2pay.com.br/v2';
    this.apiKey = import.meta.env.VITE_SAFE2PAY_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_SAFE2PAY_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      console.warn('Safe2Pay credentials not configured. Payment processing will fail.');
    }
  }

  /**
   * Create a payment transaction with Safe2Pay
   * 
   * API Endpoint: POST /Payment
   * Documentation: https://developers.safe2pay.com.br/reference/post_payment
   */
  async createPayment(request: Safe2PayPaymentRequest): Promise<Safe2PayPaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/Payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify({
          PaymentMethod: this.mapPaymentMethod(request.paymentMethod),
          Amount: request.amount,
          DueDate: request.dueDate,
          Description: request.description,
          Reference: request.reference,
          Customer: {
            Name: request.customer.name,
            Email: request.customer.email,
            Identity: request.customer.identity,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment');
      }

      const data = await response.json();

      return {
        success: data.HasError === false,
        transactionId: data.IdTransaction?.toString() || '',
        status: this.mapSafe2PayStatus(data.Status),
        paymentUrl: data.PaymentUrl,
        barcode: data.BankSlipNumber,
        pixQrCode: data.QrCodeBase64,
        message: data.Message,
      };
    } catch (error) {
      console.error('Safe2Pay API Error:', error);
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check payment status
   * 
   * API Endpoint: GET /Payment/{transactionId}
   */
  async checkPaymentStatus(transactionId: string): Promise<Safe2PayPaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/Payment/${transactionId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();

      return {
        success: data.HasError === false,
        transactionId: data.IdTransaction?.toString() || transactionId,
        status: this.mapSafe2PayStatus(data.Status),
        paymentUrl: data.PaymentUrl,
        barcode: data.BankSlipNumber,
        pixQrCode: data.QrCodeBase64,
        message: data.Message,
      };
    } catch (error) {
      console.error('Safe2Pay API Error:', error);
      return {
        success: false,
        transactionId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a payment
   * 
   * API Endpoint: POST /Payment/Cancel
   */
  async cancelPayment(transactionId: string): Promise<Safe2PayPaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/Payment/Cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify({
          IdTransaction: transactionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      const data = await response.json();

      return {
        success: data.HasError === false,
        transactionId,
        status: 'refunded',
        message: data.Message || 'Payment cancelled successfully',
      };
    } catch (error) {
      console.error('Safe2Pay API Error:', error);
      return {
        success: false,
        transactionId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(transactionId: string): Promise<Safe2PayPaymentResponse> {
    // Same as checkPaymentStatus
    return this.checkPaymentStatus(transactionId);
  }

  // Helper methods

  /**
   * Map our payment method to Safe2Pay format
   */
  private mapPaymentMethod(method: string): number {
    const methodMap: Record<string, number> = {
      'credit_card': 1,
      'boleto': 2,
      'pix': 7,
    };
    return methodMap[method] || 2; // Default to boleto
  }

  /**
   * Map Safe2Pay status to our status format
   */
  private mapSafe2PayStatus(status: number): string {
    const statusMap: Record<number, string> = {
      1: 'pending',     // Pendente
      2: 'pending',     // Processando
      3: 'paid',        // Autorizado/Pago
      4: 'failed',      // Cancelado
      5: 'refunded',    // Estornado
      6: 'failed',      // Negado
    };
    return statusMap[status] || 'pending';
  }
}

// Export singleton instance
export const realSafe2PayService = new RealSafe2PayService();

