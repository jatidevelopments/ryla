/**
 * Pricing constants for RYLA
 *
 * Re-exports from @ryla/shared - the single source of truth for all credit pricing.
 *
 * @see libs/shared/src/credits/pricing.ts
 * @see docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md
 */

// Re-export everything from shared
export {
  // Types
  type FeatureId,
  type ModelId,
  type QualityMode,
  type PlanId,
  type FeatureDefinition,
  type PlanDefinition,
  type CreditPackage,
  type SubscriptionPlan,
  // Feature costs
  FEATURE_CREDITS,
  getFeatureCost,
  getFeatureDefinition,
  hasEnoughCredits,
  calculateUsageCount,
  listFeatures,
  getSelfHostedFeatures,
  getExternalFeatures,
  // Plans
  PLAN_CREDITS,
  SUBSCRIPTION_PLANS,
  getPlanDefinition,
  getSubscriptionPlan,
  // Packages
  CREDIT_PACKAGES,
  getCreditPackage,
  getPackageCredits,
  // Legacy (deprecated)
  CREDIT_COSTS,
  PLAN_CREDIT_LIMITS,
} from '@ryla/shared';

/**
 * Calculate how many times a feature can be used with given credits
 * @deprecated Use calculateUsageCount from @ryla/shared instead
 */
export function calculateGenerations(
  credits: number,
  quality: 'draft' | 'hq' = 'draft'
): number {
  // Legacy mapping: draft = studio_fast (5), hq = studio_standard (15)
  const cost = quality === 'hq' ? 15 : 5;
  return Math.floor(credits / cost);
}
