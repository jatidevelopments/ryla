// Providers
export { StripeProvider } from './providers/stripe.provider';
export { FinbyProvider } from './providers/finby.provider';
// PayPalProvider requires @paypal/checkout-server-sdk - export only if needed
// export { PayPalProvider } from './providers/paypal.provider';
export { TrustPayProvider } from './providers/trustpay.provider';
export { Shift4Provider } from './providers/shift4.provider';

// Factory
export { createPaymentProvider } from './factory';

// Types
export type {
  PaymentProvider,
  PaymentProviderConfig,
  PaymentProviderType,
  StripeConfig,
  FinbyConfig,
  PayPalConfig,
  TrustPayConfig,
  Shift4Config,
  CheckoutSessionParams,
  CheckoutSession,
  SubscriptionStatus,
  PaymentEvent,
  PaymentEventType,
  Customer,
  CreateCustomerParams,
  PaymentStatus,
  Plan,
  PlanInterval,
} from './types';

// Config
export { paymentsConfig, getPaymentsConfig } from './config';

// Webhook handlers
export { createStripeWebhookHandler } from './webhooks/stripe.webhook';
export { createFinbyWebhookHandler } from './webhooks/finby.webhook';
export { createFinbyV3WebhookHandler } from './webhooks/finby-v3.webhook';

// Utilities
export { generateFinbyReference, isFunnelReference } from './utils/finby-reference';

// Credits
export {
  grantCredits,
  grantSubscriptionCredits,
  getCreditsForPlan,
  PLAN_CREDITS,
  type CreditGrantParams,
  type CreditGrantResult,
} from './credits';
