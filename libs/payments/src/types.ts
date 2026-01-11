// ============================================================================
// Provider Types
// ============================================================================

export type PaymentProviderType = 'stripe' | 'finby' | 'paypal' | 'trustpay' | 'shift4';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey?: string;
}

export interface FinbyConfig {
  // API v3 (Popup-based) - Required for funnel
  projectId?: string;
  secretKey?: string;

  // REST API v1 (Subscription-based) - Future
  apiKey?: string;
  merchantId?: string;

  webhookSecret?: string;
  baseUrl?: string;

  // API version selection
  apiVersion?: 'v3' | 'v1';
}

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  url: string; // PayPal API URL (sandbox or live)
  environment?: 'sandbox' | 'live';
}

export interface TrustPayConfig {
  url: string;
  tpUsername: string;
  tpSecret: string;
  tokenUrl: string;
}

export interface Shift4Config {
  apiUrl: string;
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  tosUrl?: string; // Terms of service URL
}

export type PaymentProviderConfig = StripeConfig | FinbyConfig | PayPalConfig | TrustPayConfig | Shift4Config;

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

  // Payment mode (Stripe only)
  mode?: 'subscription' | 'payment'; // 'subscription' for recurring, 'payment' for one-time

  // Finby API v3 specific (popup-based)
  productId?: number; // Product ID for API v3
  amount?: number; // Amount in cents
  currency?: string; // Currency code (default: EUR)
  cardHolder?: string;
  billingStreet?: string;
  billingCity?: string;
  billingPostcode?: string;
  billingCountry?: string;
  errorUrl?: string;
  notificationUrl?: string;
  reference?: string; // Custom reference (will be generated if not provided)

  // For recurring payments (Finby API v1)
  originalPaymentRequestId?: string; // Original payment request ID for subsequent recurring charges
  cardHash?: string; // Card token/hash for recurring payments
}

export interface CheckoutSession {
  id: string;
  url: string;
  provider: PaymentProviderType;
  reference?: string; // Payment reference (for Finby API v3)
  transactionId?: string; // Transaction ID (for Finby API v3)
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
  | 'subscription.suspended'
  | 'subscription.activated'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'refund.created'
  | 'chargeback.created';

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
  type: 'subscription.created' | 'subscription.updated' | 'subscription.cancelled' | 'subscription.renewed' | 'subscription.activated' | 'subscription.suspended';
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
    currentPeriodEnd?: Date;
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

export interface ChargebackEvent extends BasePaymentEvent {
  type: 'chargeback.created';
  data: {
    chargeId: string;
    subscriptionId?: string;
    customerId: string;
    amount: number;
    currency: string;
    reason?: string;
  };
}

export type PaymentEvent =
  | CheckoutCompletedEvent
  | SubscriptionEvent
  | PaymentSucceededEvent
  | PaymentFailedEvent
  | RefundEvent
  | ChargebackEvent;

// ============================================================================
// Provider Interface
// ============================================================================

// ============================================================================
// Customer Types
// ============================================================================

export interface Customer {
  id: string;
  email: string;
  provider: PaymentProviderType;
  metadata?: Record<string, string>;
}

export interface CreateCustomerParams {
  email: string;
  userId?: string;
  metadata?: Record<string, string>;
}

// ============================================================================
// Payment Status Types
// ============================================================================

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'processing' | 'authorized' | 'refunded';
  amount: number;
  currency: string;
  reference?: string;
  failureMessage?: string;
  paidAt?: Date;
}

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

  // Customer Management (Optional - not all providers support)
  createCustomer?(params: CreateCustomerParams): Promise<Customer>;
  getCustomer?(customerId: string): Promise<Customer | null>;

  // Payment Status (Optional - provider-specific)
  getPaymentStatus?(paymentId: string): Promise<PaymentStatus | null>;
}
