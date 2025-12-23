'use client';

import { trpc } from '../trpc';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'unlimited';

/**
 * Hook to get current subscription status
 * Provides tier, status, and premium check functionality
 */
export function useSubscription() {
  const { data, isLoading, error, refetch } = trpc.subscription.getCurrent.useQuery(
    undefined,
    {
      // Refetch every 60 seconds to keep subscription status updated
      refetchInterval: 60000,
      // Keep previous data while refetching
      placeholderData: (prev) => prev,
    }
  );

  const tier = (data?.tier ?? 'free') as SubscriptionTier;

  return {
    // Subscription data
    tier,
    status: data?.status ?? 'active',
    currentPeriodStart: data?.currentPeriodStart,
    currentPeriodEnd: data?.currentPeriodEnd,
    cancelAtPeriodEnd: data?.cancelAtPeriodEnd ?? false,

    // Convenience checks
    isPro: tier === 'pro' || tier === 'unlimited',
    isStarter: tier === 'starter',
    isFree: tier === 'free',
    isPaid: tier !== 'free',

    // Loading/error states
    isLoading,
    error,

    // Actions
    refetch,
  };
}

