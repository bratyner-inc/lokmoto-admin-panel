# ADR 003: Payment Integration Strategy (Safe2Pay)

## Status
Accepted (Phase 1: Stub Implementation)

## Context
The Lokmoto platform requires payment processing for:
1. **Platform Subscriptions**: Rental companies pay monthly to use the platform
2. **Rental Payments**: Customers pay for motorcycle rentals (quinzenal/mensal)

We are using Safe2Pay as the payment gateway. For Phase 1 (Rental Company Flow), we need a strategy that allows development to continue while full payment integration is completed later.

## Decision

### Phase 1: Stub Implementation (Current)
Implement a payment service stub that:
- Records payment attempts in the `transactions` table
- Always sets status as "pending"
- Tracks subscription status for UI purposes
- Provides mock responses for testing

### Phase 2: Full Integration (Future)
Implement complete Safe2Pay integration:
- Tokenization for credit cards (PCI compliance)
- Recurring billing (Plans and Subscriptions)
- Webhook handling for payment status updates
- Refund processing

## Architecture

### Service Interface (Domain Layer)
```typescript
// src/domain/services/IPaymentService.ts
export interface IPaymentService {
  createSubscription(data: CreateSubscriptionDTO): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getPlans(): Promise<Plan[]>;
  processPayment(data: PaymentDTO): Promise<Transaction>;
}
```

### Stub Implementation (Infrastructure Layer)
```typescript
// src/infrastructure/payments/Safe2PayServiceStub.ts
export class Safe2PayServiceStub implements IPaymentService {
  async createSubscription(data: CreateSubscriptionDTO): Promise<Subscription> {
    // Record in database with status "pending"
    // Return mock subscription
    return {
      id: generateMockId(),
      status: 'pending',
      // ... mock data
    };
  }
}
```

### Real Implementation (Future)
```typescript
// src/infrastructure/payments/Safe2PayService.ts
export class Safe2PayService implements IPaymentService {
  async createSubscription(data: CreateSubscriptionDTO): Promise<Subscription> {
    // Call Safe2Pay API
    const response = await fetch('https://api.safe2pay.com.br/...', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SAFE2PAY_TOKEN,
      },
      body: JSON.stringify(data),
    });
    
    // Record in database with actual status
    // Return real subscription
  }
}
```

## Safe2Pay Integration Details

### Authentication
- API Key in header: `X-API-KEY`
- Separate keys for sandbox and production
- Store in environment variables (never in code)

### Plans and Subscriptions
```
GET /recurrence/v1/plans/ - List available plans
POST /recurrence/v1/subscriptions/ - Create subscription
GET /recurrence/v1/subscriptions/{id} - Get subscription details
PUT /recurrence/v1/subscriptions/{id}/cancel - Cancel subscription
```

### Webhook Handling
Safe2Pay sends webhooks for:
- Payment confirmed
- Payment failed
- Subscription canceled
- Subscription expired

Webhook handler:
```typescript
// src/infrastructure/payments/webhookHandler.ts
export async function handleSafe2PayWebhook(payload: WebhookPayload) {
  // Verify webhook signature
  // Update transaction status in database
  // Trigger notifications
}
```

## Data Model

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  payer_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method payment_method NOT NULL,
  status transaction_status NOT NULL,
  external_reference TEXT, -- Safe2Pay transaction ID
  safe2pay_subscription_id TEXT,
  transaction_type transaction_type NOT NULL,
  customer_data JSONB,
  rental_company_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Rental Companies Subscription Fields
```sql
subscription_status subscription_status NOT NULL DEFAULT 'pending',
subscription_plan TEXT, -- Safe2Pay plan ID
subscription_expiration TIMESTAMPTZ
```

## Security Considerations

1. **PCI Compliance**
   - Never store credit card numbers
   - Use Safe2Pay tokenization
   - Tokens handled only in frontend

2. **API Keys**
   - Store in Supabase Vault
   - Never expose in frontend code
   - Use Edge Functions for sensitive operations

3. **Webhook Verification**
   - Verify webhook signatures
   - Validate payload structure
   - Idempotent webhook processing

4. **User Data**
   - Store complete user data in transactions for auditing
   - Never expose payment details to unauthorized users

## Implementation Phases

### Phase 1 (Current - Stub)
- [x] Payment service interface
- [x] Stub implementation
- [x] Transaction recording
- [x] Basic subscription status tracking
- [ ] UI for subscription management

### Phase 2 (Future - Full Integration)
- [ ] Safe2Pay API client
- [ ] Plan synchronization
- [ ] Subscription creation and management
- [ ] Webhook endpoint
- [ ] Webhook processing logic
- [ ] Payment retry logic
- [ ] Refund processing
- [ ] Credit card tokenization

### Phase 3 (Future - Advanced Features)
- [ ] Payment analytics
- [ ] Dunning management
- [ ] Multiple payment methods
- [ ] Split payments (platform/rental company)
- [ ] Invoice generation

## Testing Strategy

### Stub Phase
- Unit tests for stub service
- UI tests with mock data
- Database transaction recording tests

### Integration Phase
- Sandbox environment testing
- Webhook simulation
- End-to-end payment flows
- Error scenario testing

## Monitoring

Track these metrics:
- Payment success rate
- Failed payment reasons
- Subscription churn rate
- Average transaction value
- Webhook processing time

## Migration Path

1. Develop with stub implementation
2. Build and test UI workflows
3. Implement real Safe2Pay service
4. Deploy behind feature flag
5. Test in sandbox
6. Gradual rollout to production

## References
- [Safe2Pay API Documentation](https://developers.safe2pay.com.br)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [Webhook Best Practices](https://docs.safe2pay.com.br/webhooks)

