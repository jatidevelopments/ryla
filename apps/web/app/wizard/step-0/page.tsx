'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';
import { StepCreationMethod } from '@/components/wizard/steps/StepCreationMethod';
import { cn } from '@ryla/ui';

export default function WizardStep0() {
  const setStep = useCharacterWizardStore((s) => s.setStep);
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setStep(0);
    // Check if request was submitted successfully
    if (searchParams?.get('request-submitted') === 'true') {
      setShowSuccess(true);
      // Clear the query param after showing message
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Remove query param from URL without reload
        window.history.replaceState({}, '', '/wizard/step-0');
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [setStep, searchParams]);

  return (
    <div className="relative">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Request Submitted Successfully!</p>
              <p className="text-white/70 text-sm mt-1">
                We've received your request to create an AI influencer from an existing person. We'll review it and contact you via email once it's been processed.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <StepCreationMethod />
    </div>
  );
}
