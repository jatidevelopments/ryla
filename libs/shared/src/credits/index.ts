/**
 * Credit System
 *
 * Single source of truth for all credit pricing, costs, and calculations.
 *
 * @example
 * import { FEATURE_CREDITS, getFeatureCost, hasEnoughCredits } from '@ryla/shared/credits';
 *
 * // Get cost for a feature
 * const cost = getFeatureCost('studio_fast'); // 2 credits
 *
 * // Check if user can afford
 * if (hasEnoughCredits(userBalance, 'profile_set_quality')) {
 *   // proceed with generation
 * }
 *
 * // Get credit package for purchase
 * const pkg = getCreditPackage('credits_350');
 */

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
  type LoraTrainingModelType,
  // Constants - Features
  FEATURE_CREDITS,
  // Constants - Plans
  PLAN_CREDITS,
  SUBSCRIPTION_PLANS,
  // Constants - Packages
  CREDIT_PACKAGES,
  // Functions - Features
  getFeatureCost,
  getFeatureDefinition,
  hasEnoughCredits,
  calculateUsageCount,
  listFeatures,
  getSelfHostedFeatures,
  getExternalFeatures,
  // Functions - Plans
  getPlanDefinition,
  getSubscriptionPlan,
  // Functions - Packages
  getCreditPackage,
  getPackageCredits,
  // Legacy (deprecated - remove after migration)
  CREDIT_COSTS,
  PLAN_CREDIT_LIMITS,
  // LoRA training cost calculation
  calculateLoraTrainingCost,
} from './pricing';

