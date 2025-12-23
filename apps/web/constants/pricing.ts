/**
 * Pricing constants for RYLA
 * 
 * These match the PLAN_CREDIT_LIMITS in libs/data/src/schema/credits.schema.ts
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyCredits: number;
  priceMonthly: number;
  priceYearly: number; // Total yearly price
  priceYearlyPerMonth: number; // Yearly price divided by 12
  features: string[];
  highlighted?: boolean;
  badge?: string;
  finbyProductIdMonthly?: string;
  finbyProductIdYearly?: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  originalPrice?: number;
  savePercent?: number;
  highlighted?: boolean;
  badge?: string;
  finbyProductId?: string;
}

/**
 * Subscription plans (monthly credit grants)
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started with AI influencers',
    monthlyCredits: 100,
    priceMonthly: 29,
    priceYearly: 199,
    priceYearlyPerMonth: 16.58,
    features: [
      '100 credits/month',
      'Create up to 3 characters',
      'Standard quality generation',
      'Basic customization',
      'Email support',
    ],
    finbyProductIdMonthly: 'starter_monthly',
    finbyProductIdYearly: 'starter_yearly',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators who want more power',
    monthlyCredits: 300,
    priceMonthly: 49,
    priceYearly: 349,
    priceYearlyPerMonth: 29.08,
    features: [
      '300 credits/month',
      'Unlimited characters',
      'HQ generation mode',
      'Advanced customization',
      'Priority support',
      'Early access to new features',
    ],
    highlighted: true,
    badge: 'Most Popular',
    finbyProductIdMonthly: 'pro_monthly',
    finbyProductIdYearly: 'pro_yearly',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'No limits, maximum creative freedom',
    monthlyCredits: Infinity,
    priceMonthly: 99,
    priceYearly: 699,
    priceYearlyPerMonth: 58.25,
    features: [
      'Unlimited credits',
      'Unlimited characters',
      'HQ generation mode',
      'All customization options',
      'Priority 24/7 support',
      'API access (coming soon)',
      'White-label options',
    ],
    badge: 'Best Value',
    finbyProductIdMonthly: 'unlimited_monthly',
    finbyProductIdYearly: 'unlimited_yearly',
  },
];

/**
 * One-time credit packages
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credits_50',
    credits: 50,
    price: 9.99,
    finbyProductId: 'credits_50',
  },
  {
    id: 'credits_150',
    credits: 150,
    price: 24.99,
    originalPrice: 29.99,
    savePercent: 17,
    finbyProductId: 'credits_150',
  },
  {
    id: 'credits_350',
    credits: 350,
    price: 49.99,
    originalPrice: 69.99,
    savePercent: 29,
    highlighted: true,
    badge: 'Best Value',
    finbyProductId: 'credits_350',
  },
  {
    id: 'credits_750',
    credits: 750,
    price: 89.99,
    originalPrice: 149.99,
    savePercent: 40,
    finbyProductId: 'credits_750',
  },
  {
    id: 'credits_1500',
    credits: 1500,
    price: 149.99,
    originalPrice: 299.99,
    savePercent: 50,
    badge: 'Most Credits',
    finbyProductId: 'credits_1500',
  },
];

/**
 * Credit costs for reference
 */
export const CREDIT_COSTS = {
  generation_draft: 5,
  generation_hq: 10,
} as const;

/**
 * Calculate how many generations a credit amount provides
 */
export function calculateGenerations(credits: number, quality: 'draft' | 'hq' = 'draft'): number {
  const cost = quality === 'hq' ? CREDIT_COSTS.generation_hq : CREDIT_COSTS.generation_draft;
  return Math.floor(credits / cost);
}

