'use client';

import { trpc } from '../../../lib/trpc';

/**
 * Hook for managing upload consent state and mutations
 */
export function useUploadConsent() {
  const utils = trpc.useUtils();
  const { data: consentData } = trpc.user.hasUploadConsent.useQuery();
  const acceptConsentMutation = trpc.user.acceptUploadConsent.useMutation({
    onSuccess: () => {
      utils.user.hasUploadConsent.invalidate();
    },
  });

  return {
    hasConsent: consentData?.hasConsent ?? false,
    acceptConsent: async () => {
      await acceptConsentMutation.mutateAsync();
    },
  };
}

