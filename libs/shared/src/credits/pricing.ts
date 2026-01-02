/**
 * Credit Pricing System - Single Source of Truth
 *
 * All credit costs, plan limits, and pricing calculations.
 * Based on 10x margin model (see docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md)
 *
 * @module @ryla/shared/credits
 */

// =============================================================================
// FEATURE TYPES
// =============================================================================

/**
 * All features that consume credits
 */
export type FeatureId =
  | 'base_images' // Character creation (3 images)
  | 'profile_set_fast' // Profile set, speed mode (8 images)
  | 'profile_set_quality' // Profile set, PuLID mode (8 images)
  | 'studio_fast' // Studio single, speed (1 image)
  | 'studio_standard' // Studio single, standard (1 image)
  | 'studio_batch' // Studio batch (4 images)
  | 'inpaint' // Edit existing image
  | 'upscale' // Enhance resolution
  | 'fal_schnell' // Fal.ai Schnell (1 image) - legacy
  | 'fal_dev' // Fal.ai Dev (1 image) - legacy
  | 'fal_pro' // Fal.ai Pro (1 image) - legacy
  | 'fal_model'; // Fal.ai model (dynamic pricing based on model ID)

/**
 * AI model identifiers
 */
export type ModelId =
  | 'z-image-turbo' // Self-hosted, fast
  | 'z-image-danrisi' // Self-hosted, optimized
  | 'z-image-pulid' // Self-hosted, face consistency
  | 'flux-dev' // Self-hosted, high quality
  | 'fal-schnell' // Fal.ai external API
  | 'fal-dev' // Fal.ai external API
  | 'fal-pro'; // Fal.ai external API

/**
 * Quality/speed modes
 */
export type QualityMode = 'fast' | 'standard' | 'quality';

/**
 * Subscription plan IDs
 */
export type PlanId = 'free' | 'starter' | 'pro' | 'unlimited';

// =============================================================================
// FEATURE CREDIT COSTS
// =============================================================================

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  description: string;
  credits: number;
  defaultImageCount: number;
  costPerImage: number; // Actual USD cost to us
}

/**
 * Credit costs per feature
 *
 * Based on:
 * - GPU cost: $0.69/hr (RTX 4090) = $0.000192/sec
 * - 10x margin target
 * - All values ×10 for psychological impact (100 credits feels better than 10)
 * - See docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md
 */
export const FEATURE_CREDITS: Record<FeatureId, FeatureDefinition> = {
  base_images: {
    id: 'base_images',
    name: 'Character Creation',
    description: 'Generate 3 base images for new character',
    credits: 100,
    defaultImageCount: 3,
    costPerImage: 0.002, // ~$0.006 total
  },
  profile_set_fast: {
    id: 'profile_set_fast',
    name: 'Profile Set (Fast)',
    description: '8 profile pictures, speed-optimized',
    credits: 200,
    defaultImageCount: 8,
    costPerImage: 0.0014, // ~$0.011 total
  },
  profile_set_quality: {
    id: 'profile_set_quality',
    name: 'Profile Set (Quality)',
    description: '8 profile pictures with face consistency',
    credits: 300,
    defaultImageCount: 8,
    costPerImage: 0.0021, // ~$0.017 total (PuLID overhead)
  },
  studio_fast: {
    id: 'studio_fast',
    name: 'Studio Quick',
    description: 'Single image, speed mode',
    credits: 20,
    defaultImageCount: 1,
    costPerImage: 0.001,
  },
  studio_standard: {
    id: 'studio_standard',
    name: 'Studio Standard',
    description: 'Single image, balanced quality',
    credits: 50,
    defaultImageCount: 1,
    costPerImage: 0.003,
  },
  studio_batch: {
    id: 'studio_batch',
    name: 'Studio Batch',
    description: '4 images in one batch',
    credits: 80,
    defaultImageCount: 4,
    costPerImage: 0.00125, // ~$0.005 total
  },
  inpaint: {
    id: 'inpaint',
    name: 'Image Edit',
    description: 'Edit/inpaint existing image',
    credits: 30,
    defaultImageCount: 1,
    costPerImage: 0.002,
  },
  upscale: {
    id: 'upscale',
    name: 'Upscale',
    description: 'Enhance image resolution',
    credits: 20,
    defaultImageCount: 1,
    costPerImage: 0.002,
  },
  fal_schnell: {
    id: 'fal_schnell',
    name: 'Premium Fast (Fal)',
    description: 'Fal.ai Schnell model',
    credits: 600,
    defaultImageCount: 1,
    costPerImage: 0.05, // External API
  },
  fal_dev: {
    id: 'fal_dev',
    name: 'Premium Quality (Fal)',
    description: 'Fal.ai Dev model',
    credits: 1200,
    defaultImageCount: 1,
    costPerImage: 0.1, // External API
  },
  fal_pro: {
    id: 'fal_pro',
    name: 'Premium Pro (Fal)',
    description: 'Fal.ai Pro model',
    credits: 1800,
    defaultImageCount: 1,
    costPerImage: 0.15, // External API
  },
  fal_model: {
    id: 'fal_model',
    name: 'Fal.ai Model',
    description: 'Dynamic pricing based on model selection',
    credits: 0, // Calculated dynamically
    defaultImageCount: 1,
    costPerImage: 0, // Calculated dynamically
  },
} as const;

// =============================================================================
// PLAN LIMITS
// =============================================================================

export interface PlanDefinition {
  id: PlanId;
  name: string;
  monthlyCredits: number;
  priceMonthly: number;
  priceYearly: number;
  isOneTime?: boolean; // Free plan credits are one-time
  isUnlimited?: boolean;
}

/**
 * Subscription plan credit allocations
 * All values ×10 for psychological impact
 */
export const PLAN_CREDITS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyCredits: 250,
    priceMonthly: 0,
    priceYearly: 0,
    isOneTime: true,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyCredits: 3000,
    priceMonthly: 29,
    priceYearly: 199, // ~$16.58/mo
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyCredits: 5000,
    priceMonthly: 49,
    priceYearly: 349, // ~$29/mo
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    monthlyCredits: Infinity,
    priceMonthly: 99,
    priceYearly: 699, // ~$58/mo
    isUnlimited: true,
  },
} as const;

// =============================================================================
// CREDIT PACKAGES (One-Time Purchase)
// =============================================================================

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  originalPrice?: number;
  savePercent?: number;
  perCreditPrice: number;
  highlighted?: boolean;
  badge?: string;
  finbyProductId?: string;
}

/**
 * One-time credit packages
 *
 * Pricing strategy:
 * - Packages are priced HIGHER per credit than subscriptions (encourages subscriptions)
 * - Larger packages have lower per-credit cost (volume discount)
 * - All values ×10 for psychological impact
 *
 * Compare to subscriptions:
 * - Starter: 3,000 credits for $29 = $0.0097/credit
 * - Packages: $0.010-0.020/credit (more expensive to encourage subs)
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credits_500',
    credits: 500,
    price: 9.99,
    perCreditPrice: 0.020,
    finbyProductId: 'credits_500',
  },
  {
    id: 'credits_1500',
    credits: 1500,
    price: 24.99,
    originalPrice: 29.99,
    savePercent: 17,
    perCreditPrice: 0.0167,
    finbyProductId: 'credits_1500',
  },
  {
    id: 'credits_3500',
    credits: 3500,
    price: 49.99,
    originalPrice: 69.99,
    savePercent: 29,
    perCreditPrice: 0.0143,
    highlighted: true,
    badge: 'Best Value',
    finbyProductId: 'credits_3500',
  },
  {
    id: 'credits_7500',
    credits: 7500,
    price: 89.99,
    originalPrice: 149.99,
    savePercent: 40,
    perCreditPrice: 0.012,
    finbyProductId: 'credits_7500',
  },
  {
    id: 'credits_15000',
    credits: 15000,
    price: 149.99,
    originalPrice: 299.99,
    savePercent: 50,
    perCreditPrice: 0.010,
    badge: 'Most Credits',
    finbyProductId: 'credits_15000',
  },
];

// =============================================================================
// SUBSCRIPTION PLANS (for frontend display)
// =============================================================================

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  description: string;
  monthlyCredits: number;
  priceMonthly: number;
  priceYearly: number;
  priceYearlyPerMonth: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  finbyProductIdMonthly?: string;
  finbyProductIdYearly?: string;
}

/**
 * Subscription plans for display
 * Credit values come from PLAN_CREDITS (×10 for psychological impact)
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started with AI influencers',
    monthlyCredits: 3000,
    priceMonthly: 29,
    priceYearly: 199,
    priceYearlyPerMonth: 16.58,
    features: [
      '3,000 credits/month',
      'Create unlimited characters',
      'All generation modes',
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
    monthlyCredits: 5000,
    priceMonthly: 49,
    priceYearly: 349,
    priceYearlyPerMonth: 29.08,
    features: [
      '5,000 credits/month',
      'Unlimited characters',
      'All generation modes',
      'Advanced customization',
      'Priority support',
      'Early access to features',
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
      'All generation modes',
      'All customization options',
      'Priority 24/7 support',
      'API access (coming soon)',
    ],
    badge: 'Best Value',
    finbyProductIdMonthly: 'unlimited_monthly',
    finbyProductIdYearly: 'unlimited_yearly',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get credit cost for a feature
 */
/**
 * Get the credit cost for a feature
 * 
 * For features with fixed cost (profile sets, base images), count is typically 1.
 * For per-use features (studio single), multiply by count.
 */
export function getFeatureCost(featureId: FeatureId, count = 1): number {
  const baseCost = FEATURE_CREDITS[featureId]?.credits ?? 0;
  return baseCost * count;
}

/**
 * Get feature definition
 */
export function getFeatureDefinition(
  featureId: FeatureId
): FeatureDefinition | undefined {
  return FEATURE_CREDITS[featureId];
}

/**
 * Get plan definition
 */
export function getPlanDefinition(planId: PlanId): PlanDefinition | undefined {
  return PLAN_CREDITS[planId];
}

/**
 * Check if user has enough credits for a feature
 */
export function hasEnoughCredits(
  balance: number,
  featureId: FeatureId,
  count = 1
): boolean {
  const cost = getFeatureCost(featureId) * count;
  return balance >= cost;
}

/**
 * Calculate how many times a feature can be used with given credits
 */
export function calculateUsageCount(
  credits: number,
  featureId: FeatureId
): number {
  const cost = getFeatureCost(featureId);
  if (cost === 0) return Infinity;
  return Math.floor(credits / cost);
}

/**
 * Get all features as array (for UI display)
 */
export function listFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_CREDITS);
}

/**
 * Get self-hosted features only (exclude Fal.ai)
 */
export function getSelfHostedFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_CREDITS).filter(
    (f) => !f.id.startsWith('fal_')
  );
}

/**
 * Get external API features only
 */
export function getExternalFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_CREDITS).filter((f) => f.id.startsWith('fal_'));
}

/**
 * Get a credit package by ID
 */
export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === packageId);
}

/**
 * Get a subscription plan by ID
 */
export function getSubscriptionPlan(planId: PlanId): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}

/**
 * Get credits for a package purchase
 */
export function getPackageCredits(packageId: string): number {
  return getCreditPackage(packageId)?.credits ?? 0;
}

// =============================================================================
// LEGACY COMPATIBILITY (TO BE REMOVED)
// =============================================================================

/**
 * @deprecated Use FEATURE_CREDITS instead
 * Legacy mapping for backward compatibility during migration
 */
export const CREDIT_COSTS = {
  draft: 20, // Maps to studio_fast
  hq: 50, // Maps to studio_standard
} as const;

/**
 * @deprecated Use PLAN_CREDITS instead
 * Legacy mapping for backward compatibility during migration
 */
export const PLAN_CREDIT_LIMITS = {
  free: 250,
  starter: 3000,
  pro: 5000,
  unlimited: Infinity,
} as const;

