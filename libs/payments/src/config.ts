import type { Plan, PaymentProviderType } from './types';

// ============================================================================
// Payments Configuration
// ============================================================================

export interface PaymentsConfig {
  defaultProvider: PaymentProviderType;
  plans: Record<string, Plan>;
  stripe?: {
    publishableKey: string;
  };
  finby?: {
    merchantId: string;
  };
}

/**
 * Default payments configuration
 * Override with getPaymentsConfig() or environment variables
 */
export const paymentsConfig: PaymentsConfig = {
  defaultProvider: 'stripe',
  plans: {
    free: {
      id: 'free',
      name: 'Free',
      description: 'Get started for free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyPriceId: '',
      yearlyPriceId: '',
      productId: '',
      features: ['5 generations per month', 'Basic features', 'Community support'],
      isFree: true,
    },
    basic: {
      id: 'basic',
      name: 'Basic',
      description: 'For individual creators',
      monthlyPrice: 9.9,
      yearlyPrice: 99,
      monthlyPriceId: process.env['STRIPE_BASIC_MONTHLY_PRICE_ID'] || '',
      yearlyPriceId: process.env['STRIPE_BASIC_YEARLY_PRICE_ID'] || '',
      productId: process.env['STRIPE_BASIC_PRODUCT_ID'] || '',
      features: [
        '100 generations per month',
        'All character options',
        'Priority processing',
        'Email support',
      ],
      isPopular: true,
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      description: 'For serious creators',
      monthlyPrice: 29.9,
      yearlyPrice: 299,
      monthlyPriceId: process.env['STRIPE_PRO_MONTHLY_PRICE_ID'] || '',
      yearlyPriceId: process.env['STRIPE_PRO_YEARLY_PRICE_ID'] || '',
      productId: process.env['STRIPE_PRO_PRODUCT_ID'] || '',
      features: [
        'Unlimited generations',
        'All character options',
        'Fastest processing',
        'Priority support',
        'API access',
        'Custom branding',
      ],
    },
  },
};

/**
 * Get payments config with optional overrides
 */
export function getPaymentsConfig(overrides?: Partial<PaymentsConfig>): PaymentsConfig {
  return {
    ...paymentsConfig,
    ...overrides,
    plans: {
      ...paymentsConfig.plans,
      ...overrides?.plans,
    },
  };
}

/**
 * Get a specific plan by ID
 */
export function getPlan(planId: string): Plan | undefined {
  return paymentsConfig.plans[planId];
}

/**
 * Get all plans as array (for pricing display)
 */
export function getAllPlans(): Plan[] {
  return Object.values(paymentsConfig.plans);
}

/**
 * Get plan by Stripe price ID
 */
export function getPlanByPriceId(priceId: string): Plan | undefined {
  return Object.values(paymentsConfig.plans).find(
    (plan) => plan.monthlyPriceId === priceId || plan.yearlyPriceId === priceId
  );
}

/**
 * Get price interval from price ID
 */
export function getPriceInterval(priceId: string): 'month' | 'year' | undefined {
  for (const plan of Object.values(paymentsConfig.plans)) {
    if (plan.monthlyPriceId === priceId) return 'month';
    if (plan.yearlyPriceId === priceId) return 'year';
  }
  return undefined;
}
