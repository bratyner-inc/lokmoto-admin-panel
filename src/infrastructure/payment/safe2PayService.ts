import { ISafe2PayService } from './ISafe2PayService';
import { mockSafe2PayService } from './MockSafe2PayService';
import { realSafe2PayService } from './RealSafe2PayService';

/**
 * Safe2Pay Service Factory
 * Returns the appropriate service implementation based on environment
 * 
 * Set VITE_USE_MOCK_PAYMENTS=true to use mock service
 * Set VITE_USE_MOCK_PAYMENTS=false to use real Safe2Pay API
 */
const useMockPayments = import.meta.env.VITE_USE_MOCK_PAYMENTS !== 'false';

export const safe2PayService: ISafe2PayService = useMockPayments 
  ? mockSafe2PayService 
  : realSafe2PayService;

// Log which service is being used
console.log(`[Safe2Pay] Using ${useMockPayments ? 'MOCK' : 'REAL'} payment service`);

// Export individual services for testing
export { mockSafe2PayService, realSafe2PayService };
export type { ISafe2PayService };

