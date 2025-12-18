// ============================================================================
// Provider Types
// ============================================================================

export type PaymentProviderType = 'stripe' | 'finby';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey?: string;
}

export interface FinbyConfig {
  apiKey: string;
  merchantId: string;
  webhookSecret?: string;
  baseUrl?: string;
}

export type PaymentProviderConfig = StripeConfig | FinbyConfig;

// ============================================================================
// Plan Types
// ============================================================================

export type PlanInterval = 'month' | 'year';

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
  productId: string;
  features: string[];
  isPopular?: boolean;
  isFree?: boolean;
}

// ============================================================================
// Checkout Types
// ============================================================================

export interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
}

export interface CheckoutSession {
  id: string;
  url: string;
  provider: PaymentProviderType;
}

// ============================================================================
// Subscription Types
// ============================================================================

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

export interface Subscription {
  id: string;
  userId: string;
  customerId: string;
  status: SubscriptionStatus;
  priceId: string;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
}

// ============================================================================
// Webhook Event Types
// ============================================================================

export type PaymentEventType =
  | 'checkout.completed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'refund.created';

export interface BasePaymentEvent {
  id: string;
  type: PaymentEventType;
  provider: PaymentProviderType;
  timestamp: Date;
  raw: unknown;
}

export interface CheckoutCompletedEvent extends BasePaymentEvent {
  type: 'checkout.completed';
  data: {
    userId: string;
    customerId: string;
    subscriptionId: string;
    priceId: string;
    email?: string;
  };
}

export interface SubscriptionEvent extends BasePaymentEvent {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.cancelled' | 'subscription.renewed';
  data: {
    subscriptionId: string;
    customerId: string;
    status: SubscriptionStatus;
    priceId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  };
}

export interface PaymentSucceededEvent extends BasePaymentEvent {
  type: 'payment.succeeded';
  data: {
    invoiceId: string;
    subscriptionId?: string;
    customerId: string;
    amount: number;
    currency: string;
  };
}

export interface PaymentFailedEvent extends BasePaymentEvent {
  type: 'payment.failed';
  data: {
    invoiceId: string;
    subscriptionId?: string;
    customerId: string;
    error?: string;
  };
}

export interface RefundEvent extends BasePaymentEvent {
  type: 'refund.created';
  data: {
    refundId: string;
    chargeId: string;
    amount: number;
    currency: string;
  };
}

export type PaymentEvent =
  | CheckoutCompletedEvent
  | SubscriptionEvent
  | PaymentSucceededEvent
  | PaymentFailedEvent
  | RefundEvent;

// ============================================================================
// Provider Interface
// ============================================================================

export interface PaymentProvider {
  readonly type: PaymentProviderType;

  // Checkout
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession>;

  // Subscriptions
  getSubscription(subscriptionId: string): Promise<Subscription | null>;
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<void>;

  // Billing Portal (Stripe only)
  createBillingPortalSession?(customerId: string, returnUrl: string): Promise<string>;

  // Refunds
  refundPayment?(paymentIntentId: string, amount?: number): Promise<void>;

  // Webhooks
  parseWebhookEvent(rawBody: string, signature: string): Promise<PaymentEvent>;
}
