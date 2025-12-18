import type { PaymentProvider, PaymentProviderType, StripeConfig, FinbyConfig } from './types';
import { StripeProvider } from './providers/stripe.provider';
import { FinbyProvider } from './providers/finby.provider';

type ConfigForProvider<T extends PaymentProviderType> = T extends 'stripe'
  ? StripeConfig
  : T extends 'finby'
    ? FinbyConfig
    : never;

/**
 * Create a payment provider instance
 *
 * @example
 * const stripe = createPaymentProvider('stripe', {
 *   secretKey: process.env.STRIPE_SECRET_KEY!,
 *   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
 * });
 *
 * @example
 * const finby = createPaymentProvider('finby', {
 *   apiKey: process.env.FINBY_API_KEY!,
 *   merchantId: process.env.FINBY_MERCHANT_ID!,
 * });
 */
export function createPaymentProvider<T extends PaymentProviderType>(
  type: T,
  config: ConfigForProvider<T>
): PaymentProvider {
  switch (type) {
    case 'stripe':
      return new StripeProvider(config as StripeConfig);
    case 'finby':
      return new FinbyProvider(config as FinbyConfig);
    default:
      throw new Error(`Unknown payment provider: ${type}`);
  }
}
