'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../lib/trpc';
import { routes } from '@/lib/routes';
import type { ReferralSource, AiInfluencerExperience } from '../constants';

export function useOnboardingForm() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [step, setStep] = useState<1 | 2>(1);
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(
    null
  );
  const [referralSourceOther, setReferralSourceOther] = useState('');
  const [experience, setExperience] = useState<AiInfluencerExperience | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: async (data) => {
      // Optimistically update the query cache to mark onboarding as completed
      // This prevents race conditions where ProtectedRoute checks before refetch completes
      utils.user.isOnboardingCompleted.setData(undefined, {
        completed: true,
        completedAt: data.onboarding.completedAt,
      });

      // Invalidate to ensure we refetch and get the latest data from server
      await utils.user.isOnboardingCompleted.invalidate();

      // Refresh the router to ensure all components get updated data
      router.refresh();

      // Navigate to dashboard
      router.push(routes.dashboard);
    },
    onError: (error) => {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!referralSource || !experience) {
      return;
    }

    // If "other" is selected, require the text input
    if (referralSource === 'other' && !referralSourceOther.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding.mutateAsync({
        referralSource,
        aiInfluencerExperience: experience,
        referralSourceOther:
          referralSource === 'other' ? referralSourceOther.trim() : undefined,
      });
    } catch (_error) {
      // Error handled in onError
    }
  }, [referralSource, experience, referralSourceOther, completeOnboarding]);

  const handleNext = useCallback(() => {
    if (step === 1) {
      // Validate step 1 before moving to step 2
      if (!referralSource) {
        return;
      }
      // If "other" is selected, require the text input
      if (referralSource === 'other' && !referralSourceOther.trim()) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Step 2: Submit the form
      if (!experience) {
        return;
      }
      handleSubmit();
    }
  }, [step, referralSource, referralSourceOther, experience, handleSubmit]);

  const canProceed =
    step === 1
      ? referralSource !== null &&
        (referralSource !== 'other' || referralSourceOther.trim().length > 0)
      : experience !== null;

  return {
    step,
    setStep,
    referralSource,
    setReferralSource,
    referralSourceOther,
    setReferralSourceOther,
    experience,
    setExperience,
    isSubmitting,
    canProceed,
    handleNext,
    handleSubmit,
  };
}
