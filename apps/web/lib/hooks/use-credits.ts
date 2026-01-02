'use client';

import { trpc } from '../trpc';

/**
 * Hook to get and manage user credits
 * Provides balance, low balance warning state, and refetch functionality
 */
export function useCredits() {
  const { data, isLoading, error, refetch } = trpc.credits.getBalance.useQuery(
    undefined,
    {
      // Refetch every 30 seconds to keep credits updated
      refetchInterval: 30000,
      // Keep previous data while refetching
      placeholderData: (prev) => prev,
    }
  );

  const dismissWarningMutation = trpc.credits.dismissLowBalanceWarning.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  return {
    // Balance data
    balance: data?.balance ?? 0,
    totalEarned: data?.totalEarned ?? 0,
    totalSpent: data?.totalSpent ?? 0,

    // Warning states
    isLowBalance: data?.isLowBalance ?? false,
    isZeroBalance: data?.isZeroBalance ?? false,
    lowBalanceThreshold: data?.lowBalanceThreshold ?? 10,
    lowBalanceWarningShown: data?.lowBalanceWarningShown ?? null,

    // Loading/error states
    isLoading,
    error,

    // Actions
    refetch,
    dismissLowBalanceWarning: () => dismissWarningMutation.mutate(),
    isDismissing: dismissWarningMutation.isPending,
  };
}

/**
 * Hook to get credit transaction history
 */
export function useCreditTransactions(options?: {
  limit?: number;
  offset?: number;
  type?: 'subscription_grant' | 'purchase' | 'generation' | 'refund' | 'bonus' | 'admin_adjustment';
}) {
  const { data, isLoading, error, refetch } = trpc.credits.getTransactions.useQuery(
    options,
    {
      // Keep previous data while refetching
      placeholderData: (prev) => prev,
    }
  );

  return {
    transactions: data?.items ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? 20,
    offset: data?.offset ?? 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to add credits (for subscription grants, purchases, etc.)
 */
export function useAddCredits() {
  const utils = trpc.useUtils();
  
  return trpc.credits.addCredits.useMutation({
    onSuccess: () => {
      // Invalidate credits query to refetch balance
      utils.credits.getBalance.invalidate();
      utils.credits.getTransactions.invalidate();
      // Invalidate activity feed to show new transaction
      utils.activity.list.invalidate();
      utils.activity.summary.invalidate();
      // Invalidate notifications (low balance warning may be created)
      utils.notifications.list.invalidate();
    },
  });
}

/**
 * Hook to refund credits for failed jobs
 */
export function useRefundFailedJob() {
  const utils = trpc.useUtils();

  return trpc.credits.refundFailedJob.useMutation({
    onSuccess: () => {
      // Invalidate credits query to refetch balance
      utils.credits.getBalance.invalidate();
      utils.credits.getTransactions.invalidate();
      // Invalidate activity feed to show refund
      utils.activity.list.invalidate();
      utils.activity.summary.invalidate();
      // Invalidate notifications (refund notification created)
      utils.notifications.list.invalidate();
    },
  });
}

