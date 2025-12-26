import type {
  PaymentProvider,
  PaymentProviderType,
  StripeConfig,
  FinbyConfig,
  PayPalConfig,
  TrustPayConfig,
  Shift4Config,
} from './types';
import { StripeProvider } from './providers/stripe.provider';
import { FinbyProvider } from './providers/finby.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { TrustPayProvider } from './providers/trustpay.provider';
import { Shift4Provider } from './providers/shift4.provider';

type ConfigForProvider<T extends PaymentProviderType> = T extends 'stripe'
  ? StripeConfig
  : T extends 'finby'
  ? FinbyConfig
  : T extends 'paypal'
  ? PayPalConfig
  : T extends 'trustpay'
  ? TrustPayConfig
  : T extends 'shift4'
  ? Shift4Config
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
 * // Finby API v3 (popup-based) - for funnel app
 * const finby = createPaymentProvider('finby', {
 *   projectId: process.env.FINBY_PROJECT_ID!,
 *   secretKey: process.env.FINBY_SECRET_KEY!,
 *   apiVersion: 'v3',
 * });
 *
 * @example
 * // Finby API v1 (REST-based) - for future subscription features
 * const finby = createPaymentProvider('finby', {
 *   apiKey: process.env.FINBY_API_KEY!,
 *   merchantId: process.env.FINBY_MERCHANT_ID!,
 *   apiVersion: 'v1',
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
    case 'paypal':
      return new PayPalProvider(config as PayPalConfig);
    case 'trustpay':
      return new TrustPayProvider(config as TrustPayConfig);
    case 'shift4':
      return new Shift4Provider(config as Shift4Config);
    default:
      throw new Error(`Unknown payment provider: ${type}`);
  }
}
