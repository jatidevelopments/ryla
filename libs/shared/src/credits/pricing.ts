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
  | 'fal_model' // Fal.ai model (dynamic pricing based on model ID)
  | 'lora_training_z_image_base' // LoRA training base cost (Z-Image)
  | 'lora_training_z_image_per_image' // LoRA training per-image cost (Z-Image)
  | 'lora_training_flux_base' // LoRA training base cost (Flux)
  | 'lora_training_flux_per_image' // LoRA training per-image cost (Flux)
  | 'lora_training_one_base' // LoRA training base cost (One 2.1/2.2)
  | 'lora_training_one_per_image'; // LoRA training per-image cost (One 2.1/2.2)

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
    credits: 80, // 80 credits = $0.08 (Cost ~$0.006) - 13.3x margin (adjusted for competitive positioning)
    defaultImageCount: 3,
    costPerImage: 0.002,
  },
  profile_set_fast: {
    id: 'profile_set_fast',
    name: 'Profile Set (Fast)',
    description: '8 profile pictures, speed-optimized',
    credits: 120, // 120 credits = $0.12 (Cost ~$0.011) - 10.9x margin (adjusted for competitive positioning)
    defaultImageCount: 8,
    costPerImage: 0.0014,
  },
  profile_set_quality: {
    id: 'profile_set_quality',
    name: 'Profile Set (Quality)',
    description: '8 profile pictures with face consistency',
    credits: 250, // 250 credits = $0.25 (Cost ~$0.017) - 14.7x margin (adjusted for competitive positioning)
    defaultImageCount: 8,
    costPerImage: 0.0021,
  },
  studio_fast: {
    id: 'studio_fast',
    name: 'Studio Quick',
    description: 'Single image, speed mode',
    credits: 15, // 15 credits = $0.015 (Cost ~$0.0012) - 12.5x margin (adjusted for competitive positioning)
    defaultImageCount: 1,
    costPerImage: 0.001,
  },
  studio_standard: {
    id: 'studio_standard',
    name: 'Studio Standard',
    description: 'Single image, balanced quality',
    credits: 40, // 40 credits = $0.040 (Cost ~$0.003) - 13.3x margin (adjusted for competitive positioning)
    defaultImageCount: 1,
    costPerImage: 0.003,
  },
  studio_batch: {
    id: 'studio_batch',
    name: 'Studio Batch',
    description: '4 images in one batch',
    credits: 50, // 50 credits = $0.050 (Cost ~$0.005) - 10x margin (adjusted proportionally to studio_fast)
    defaultImageCount: 4,
    costPerImage: 0.00125,
  },
  inpaint: {
    id: 'inpaint',
    name: 'Image Edit',
    description: 'Edit/inpaint existing image',
    credits: 10, // 10 credits = $0.010 (Cost ~$0.002) - 5x margin
    defaultImageCount: 1,
    costPerImage: 0.002,
  },
  upscale: {
    id: 'upscale',
    name: 'Upscale',
    description: 'Enhance image resolution',
    credits: 10, // 10 credits = $0.010 (Cost ~$0.002) - 5x margin
    defaultImageCount: 1,
    costPerImage: 0.002,
  },
  fal_schnell: {
    id: 'fal_schnell',
    name: 'Premium Fast (Fal)',
    description: 'Fal.ai Schnell model',
    credits: 10, // 10 credits = $0.010 (Cost $0.003) - 3.3x margin
    defaultImageCount: 1,
    costPerImage: 0.003,
  },
  fal_dev: {
    id: 'fal_dev',
    name: 'Premium Quality (Fal)',
    description: 'Fal.ai Dev model',
    credits: 50, // 50 credits = $0.050 (Cost $0.025) - 2x margin
    defaultImageCount: 1,
    costPerImage: 0.025,
  },
  fal_pro: {
    id: 'fal_pro',
    name: 'Premium Pro (Fal)',
    description: 'Fal.ai Pro model',
    credits: 150, // 150 credits = $0.150 (Cost ~$0.06) - 2.5x margin
    defaultImageCount: 1,
    costPerImage: 0.06,
  },
  fal_model: {
    id: 'fal_model',
    name: 'Fal.ai Model',
    description: 'Dynamic pricing based on model selection',
    credits: 0, // Calculated dynamically
    defaultImageCount: 1,
    costPerImage: 0, // Calculated dynamically
  },
  // LoRA Training Costs (Base + Per-Image)
  // Credit value: ~$0.001 per credit (based on packages: $0.00091-$0.0015)
  // Actual training costs: Z-Image ~$4, Flux/One ~$6-7
  // Target margin: 5x (consistent with other features)
  lora_training_z_image_base: {
    id: 'lora_training_z_image_base',
    name: 'LoRA Training Base (Z-Image)',
    description: 'Base cost for Z-Image Turbo LoRA training (~1 hour GPU time)',
    credits: 15000, // 15,000 credits = ~$15 (Cost ~$3-4) - 4-5x margin
    defaultImageCount: 0,
    costPerImage: 3.5, // Actual cost ~$3.5 for base training
  },
  lora_training_z_image_per_image: {
    id: 'lora_training_z_image_per_image',
    name: 'LoRA Training Per Image (Z-Image)',
    description: 'Per-image processing cost for Z-Image Turbo LoRA training',
    credits: 1000, // 1,000 credits = ~$1 per image (Cost ~$0.10-0.15) - 7-10x margin
    defaultImageCount: 1,
    costPerImage: 0.12, // Actual cost ~$0.12 per image processing
  },
  lora_training_flux_base: {
    id: 'lora_training_flux_base',
    name: 'LoRA Training Base (Flux)',
    description: 'Base cost for Flux Dev LoRA training (~1.5 hours GPU time)',
    credits: 25000, // 25,000 credits = ~$25 (Cost ~$5-6) - 4-5x margin
    defaultImageCount: 0,
    costPerImage: 5.5, // Actual cost ~$5.5 for base training
  },
  lora_training_flux_per_image: {
    id: 'lora_training_flux_per_image',
    name: 'LoRA Training Per Image (Flux)',
    description: 'Per-image processing cost for Flux Dev LoRA training',
    credits: 1000, // 1,000 credits = ~$1 per image (Cost ~$0.10-0.15) - 7-10x margin
    defaultImageCount: 1,
    costPerImage: 0.12, // Actual cost ~$0.12 per image processing
  },
  lora_training_one_base: {
    id: 'lora_training_one_base',
    name: 'LoRA Training Base (One)',
    description: 'Base cost for One 2.1/2.2 LoRA training (~1.5 hours GPU time)',
    credits: 25000, // 25,000 credits = ~$25 (Cost ~$5-6) - 4-5x margin
    defaultImageCount: 0,
    costPerImage: 5.5, // Actual cost ~$5.5 for base training
  },
  lora_training_one_per_image: {
    id: 'lora_training_one_per_image',
    name: 'LoRA Training Per Image (One)',
    description: 'Per-image processing cost for One 2.1/2.2 LoRA training',
    credits: 1000, // 1,000 credits = ~$1 per image (Cost ~$0.10-0.15) - 7-10x margin
    defaultImageCount: 1,
    costPerImage: 0.12, // Actual cost ~$0.12 per image processing
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
    monthlyCredits: 500, // 500 credits = $0.50 value (Trial)
    priceMonthly: 0,
    priceYearly: 0,
    isOneTime: true,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyCredits: 30000,
    priceMonthly: 29,
    priceYearly: 199,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyCredits: 60000,
    priceMonthly: 49,
    priceYearly: 349,
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    monthlyCredits: Infinity,
    priceMonthly: 99,
    priceYearly: 699,
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
    id: 'credits_pack_2000',
    credits: 2000,
    price: 2.99,
    perCreditPrice: 0.0015,
    finbyProductId: 'credits_2000',
  },
  {
    id: 'credits_pack_8000',
    credits: 8000,
    price: 9.99,
    perCreditPrice: 0.00125,
    finbyProductId: 'credits_8000',
  },
  {
    id: 'credits_pack_22000',
    credits: 22000,
    price: 24.99,
    savePercent: 10,
    perCreditPrice: 0.00114,
    finbyProductId: 'credits_22000',
    highlighted: true,
    badge: 'Popular Refill',
  },
  {
    id: 'credits_pack_50000',
    credits: 50000,
    price: 49.99,
    originalPrice: 59.99,
    savePercent: 20,
    perCreditPrice: 0.00100,
    finbyProductId: 'credits_50000',
  },
  {
    id: 'credits_pack_110000',
    credits: 110000,
    price: 99.99,
    originalPrice: 139.99,
    savePercent: 27,
    perCreditPrice: 0.00091,
    finbyProductId: 'credits_110000',
    badge: 'Best Value',
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
    monthlyCredits: 30000,
    priceMonthly: 29,
    priceYearly: 199,
    priceYearlyPerMonth: 16.58,
    features: [
      '30,000 credits/month',
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
    monthlyCredits: 60000,
    priceMonthly: 49,
    priceYearly: 349,
    priceYearlyPerMonth: 29.08,
    features: [
      '60,000 credits/month',
      'Unlimited characters',
      'All generation modes',
      'NSFW Generator (18+ content)',
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
      'NSFW Generator (18+ content)',
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
 * Calculate LoRA training cost based on model and image count
 * 
 * Formula: Base Cost + (Image Count × Per-Image Cost)
 * 
 * @param model - Model type for LoRA training
 * @param imageCount - Number of images to use for training (minimum 5)
 * @returns Total credit cost
 */
export function calculateLoraTrainingCost(
  model: 'z-image-turbo' | 'flux' | 'one-2.1' | 'one-2.2',
  imageCount: number
): number {
  const baseFeatureId =
    model === 'z-image-turbo' ? 'lora_training_z_image_base' :
      model === 'flux' ? 'lora_training_flux_base' :
        'lora_training_one_base';

  const perImageFeatureId =
    model === 'z-image-turbo' ? 'lora_training_z_image_per_image' :
      model === 'flux' ? 'lora_training_flux_per_image' :
        'lora_training_one_per_image';

  const baseCost = FEATURE_CREDITS[baseFeatureId]?.credits ?? 0;
  const perImageCost = FEATURE_CREDITS[perImageFeatureId]?.credits ?? 0;

  return baseCost + (imageCount * perImageCost);
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
  draft: 15, // Maps to studio_fast (updated to match new pricing)
  hq: 40, // Maps to studio_standard (updated to match new pricing)
} as const;

/**
 * @deprecated Use PLAN_CREDITS instead
 * Legacy mapping for backward compatibility during migration
 */
export const PLAN_CREDIT_LIMITS = {
  free: 500,
  starter: 30000,
  pro: 60000,
  unlimited: Infinity,
} as const;

