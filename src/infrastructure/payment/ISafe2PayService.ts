import { Safe2PayPaymentRequest, Safe2PayPaymentResponse } from '@/domain/entities/Transaction';

/**
 * Safe2Pay Payment Service Interface
 * This interface defines the contract for Safe2Pay integration
 */
export interface ISafe2PayService {
  /**
   * Create a payment transaction with Safe2Pay
   */
  createPayment(request: Safe2PayPaymentRequest): Promise<Safe2PayPaymentResponse>;

  /**
   * Check payment status
   */
  checkPaymentStatus(transactionId: string): Promise<Safe2PayPaymentResponse>;

  /**
   * Cancel a payment
   */
  cancelPayment(transactionId: string): Promise<Safe2PayPaymentResponse>;

  /**
   * Get payment details
   */
  getPaymentDetails(transactionId: string): Promise<Safe2PayPaymentResponse>;
}

