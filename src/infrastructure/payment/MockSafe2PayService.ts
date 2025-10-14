import { ISafe2PayService } from './ISafe2PayService';
import { Safe2PayPaymentRequest, Safe2PayPaymentResponse, PaymentMethod } from '@/domain/entities/Transaction';

/**
 * Mock Safe2Pay Service
 * Simulates Safe2Pay API responses for development and testing
 * 
 * Replace this with RealSafe2PayService when ready to integrate with actual API
 */
export class MockSafe2PayService implements ISafe2PayService {
  private mockTransactions: Map<string, Safe2PayPaymentResponse> = new Map();

  /**
   * Create a payment transaction (mock implementation)
   */
  async createPayment(request: Safe2PayPaymentRequest): Promise<Safe2PayPaymentResponse> {
    // Simulate API delay
    await this.delay(500);

    // Generate mock transaction ID
    const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create mock response based on payment method
    const response: Safe2PayPaymentResponse = {
      success: true,
      transactionId,
      status: 'pending',
      message: 'Payment created successfully (MOCK)',
    };

    // Add payment-method-specific data
    if (request.paymentMethod === 'boleto') {
      response.paymentUrl = `https://mock-safe2pay.com/boleto/${transactionId}`;
      response.barcode = this.generateMockBarcode();
    } else if (request.paymentMethod === 'pix') {
      response.paymentUrl = `https://mock-safe2pay.com/pix/${transactionId}`;
      response.pixQrCode = this.generateMockPixQrCode();
    } else if (request.paymentMethod === 'credit_card') {
      // Credit card payments are processed immediately in mock
      response.status = 'paid';
      response.message = 'Payment processed successfully (MOCK)';
    }

    // Store transaction for later queries
    this.mockTransactions.set(transactionId, response);

    return response;
  }

  /**
   * Check payment status (mock implementation)
   */
  async checkPaymentStatus(transactionId: string): Promise<Safe2PayPaymentResponse> {
    await this.delay(300);

    // Get stored transaction or return not found
    const storedTransaction = this.mockTransactions.get(transactionId);
    
    if (!storedTransaction) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        error: 'Transaction not found (MOCK)',
      };
    }

    // Randomly mark some pending transactions as paid (simulate webhook)
    if (storedTransaction.status === 'pending' && Math.random() > 0.7) {
      storedTransaction.status = 'paid';
      storedTransaction.message = 'Payment confirmed (MOCK)';
      this.mockTransactions.set(transactionId, storedTransaction);
    }

    return storedTransaction;
  }

  /**
   * Cancel a payment (mock implementation)
   */
  async cancelPayment(transactionId: string): Promise<Safe2PayPaymentResponse> {
    await this.delay(300);

    const storedTransaction = this.mockTransactions.get(transactionId);

    if (!storedTransaction) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        error: 'Transaction not found (MOCK)',
      };
    }

    // Update transaction status
    storedTransaction.status = 'refunded';
    storedTransaction.message = 'Payment cancelled successfully (MOCK)';
    this.mockTransactions.set(transactionId, storedTransaction);

    return storedTransaction;
  }

  /**
   * Get payment details (mock implementation)
   */
  async getPaymentDetails(transactionId: string): Promise<Safe2PayPaymentResponse> {
    await this.delay(200);

    const storedTransaction = this.mockTransactions.get(transactionId);

    if (!storedTransaction) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        error: 'Transaction not found (MOCK)',
      };
    }

    return storedTransaction;
  }

  // Helper methods

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockBarcode(): string {
    // Generate a fake boleto barcode (48 digits)
    let barcode = '';
    for (let i = 0; i < 48; i++) {
      barcode += Math.floor(Math.random() * 10);
    }
    return barcode;
  }

  private generateMockPixQrCode(): string {
    // Generate a fake PIX QR code
    return `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 38).toUpperCase()}520400005303986540${(Math.random() * 1000).toFixed(2)}5802BR5913MOCK PAYMENT6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  /**
   * Clear all mock transactions (for testing)
   */
  clearMockData(): void {
    this.mockTransactions.clear();
  }
}

// Export singleton instance
export const mockSafe2PayService = new MockSafe2PayService();

