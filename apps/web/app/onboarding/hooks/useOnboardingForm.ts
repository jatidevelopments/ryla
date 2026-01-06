'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../lib/trpc';
import type { ReferralSource, AiInfluencerExperience } from '../constants';

export function useOnboardingForm() {
  const router = useRouter();
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(null);
  const [referralSourceOther, setReferralSourceOther] = useState('');
  const [experience, setExperience] = useState<AiInfluencerExperience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
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
        referralSourceOther: referralSource === 'other' ? referralSourceOther.trim() : undefined,
      });
    } catch (error) {
      // Error handled in onError
    }
  }, [referralSource, experience, referralSourceOther, completeOnboarding]);

  const canSubmit =
    referralSource !== null &&
    experience !== null &&
    (referralSource !== 'other' || referralSourceOther.trim().length > 0);

  return {
    referralSource,
    setReferralSource,
    referralSourceOther,
    setReferralSourceOther,
    experience,
    setExperience,
    isSubmitting,
    canSubmit,
    handleSubmit,
  };
}

