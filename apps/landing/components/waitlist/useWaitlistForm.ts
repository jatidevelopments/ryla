'use client';

import { useState, useCallback } from 'react';
import type { ReferralSource, AiInfluencerExperience } from './constants';

interface WaitlistFormData {
  email: string;
  referralSource: ReferralSource | null;
  referralSourceOther: string;
  experience: AiInfluencerExperience | null;
  customMessage: string;
}

export function useWaitlistForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(null);
  const [referralSourceOther, setReferralSourceOther] = useState('');
  const [experience, setExperience] = useState<AiInfluencerExperience | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNext = useCallback(() => {
    if (step === 1) {
      // Validate email before moving to step 2
      if (!email.trim() || !validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      // Validate step 2 before moving to step 3
      if (!referralSource) {
        setError('Please select where you heard about us');
        return;
      }
      // If "other" is selected, require the text input
      if (referralSource === 'other' && !referralSourceOther.trim()) {
        setError('Please specify where you heard about us');
        return;
      }
      setError(null);
      setStep(3);
    }
  }, [step, email, referralSource, referralSourceOther]);

  const handleSubmit = useCallback(async () => {
    if (step !== 3) {
      return;
    }

    if (!experience) {
      setError('Please select your experience level');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use main API backend (works for both Fly.io and Cloudflare Pages)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://end.ryla.ai';
      const response = await fetch(`${apiUrl}/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          referralSource,
          referralSourceOther: referralSource === 'other' ? referralSourceOther.trim() : undefined,
          aiInfluencerExperience: experience,
          customMessage: customMessage.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to join waitlist. Please try again.');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [step, email, referralSource, referralSourceOther, experience, customMessage]);

  const canProceed =
    step === 1
      ? email.trim().length > 0 && validateEmail(email)
      : step === 2
        ? referralSource !== null &&
          (referralSource !== 'other' || referralSourceOther.trim().length > 0)
        : experience !== null;

  return {
    step,
    setStep,
    email,
    setEmail,
    referralSource,
    setReferralSource,
    referralSourceOther,
    setReferralSourceOther,
    experience,
    setExperience,
    customMessage,
    setCustomMessage,
    isSubmitting,
    isSuccess,
    error,
    canProceed,
    handleNext,
    handleSubmit,
  };
}
