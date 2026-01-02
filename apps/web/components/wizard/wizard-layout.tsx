'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  useCharacterWizardStore,
  useWizardProgress,
  useCurrentStep,
  useCanProceed,
} from '@ryla/business';
import { cn } from '@ryla/ui';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const step = useCharacterWizardStore((s) => s.step);
  const steps = useCharacterWizardStore((s) => s.steps);
  const form = useCharacterWizardStore((s) => s.form);
  const updateSteps = useCharacterWizardStore((s) => s.updateSteps);
  const nextStep = useCharacterWizardStore((s) => s.nextStep);
  const prevStep = useCharacterWizardStore((s) => s.prevStep);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const progress = useWizardProgress();
  const currentStep = useCurrentStep();
  const canProceed = useCanProceed(); // Use derived hook that subscribes to form changes

  // Initialize steps on mount if they're missing (e.g., after page reload)
  React.useEffect(() => {
    if (form.creationMethod && steps.length === 0) {
      updateSteps(form.creationMethod);
    }
  }, [form.creationMethod, steps.length, updateSteps]);

  const isFirstStep = step === 0 || step === 1;
  const isLastStep = step === steps.length;

  const handleNext = () => {
    if (canProceed) {
      // Calculate next step number before updating store
      const nextStepNumber = step + 1;
      
      // Update store state immediately for instant UI feedback
      if (!isLastStep) {
        nextStep();
      }
      
      // Navigate in a transition to make it feel instant
      startTransition(() => {
        router.push(`/wizard/step-${nextStepNumber}`);
      });
    }
  };

  const handleBack = () => {
    // Update store state immediately for instant UI feedback
    if (step > 1) {
      prevStep();
    }
    
    // Navigate in a transition to make it feel instant
    startTransition(() => {
      if (step === 1) {
        // Go back to creation method selection
        router.push('/wizard/step-0');
      } else if (step > 1) {
        router.push(`/wizard/step-${step - 1}`);
      }
    });
  };

  const handleCancel = () => {
    resetForm();
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col">
      {/* Wizard Header - Navigation within main app */}
      <div className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-sm border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          {/* Back Button */}
          <button
            onClick={step === 0 ? handleCancel : handleBack}
            className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="hidden sm:inline">
              {step === 0 ? 'Cancel' : 'Back'}
            </span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/90">
              {step === 0 ? 'Create Influencer' : currentStep?.title || 'Create Influencer'}
            </span>
          </div>

          {/* Step indicator */}
          <div className="text-right min-w-[60px]">
            {step > 0 && steps.length > 0 && (
              <span className="text-sm text-white/50">
                {step}/{steps.length}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar - only show when not on step 0 */}
        {step > 0 && steps.length > 0 && (
          <div className="h-1 w-full bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col px-4 py-6">
          {children}

          {/* Continue Button - flows at the bottom of content */}
          {/* Hide on last step since step-finalize has its own "Create Character" button */}
          {step > 0 && !isLastStep && (
            <div className="mt-8 pb-6">
              <button
                onClick={handleNext}
                disabled={!canProceed || isPending}
                className={cn(
                  'w-full h-12 rounded-xl font-bold text-base transition-all duration-200 relative overflow-hidden',
                  canProceed && !isPending
                    ? 'bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                )}
              >
                {/* Shimmer effect */}
                {canProceed && (
                  <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                )}
                <span className="relative z-10">Continue</span>
              </button>
              {/* Step dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      s.id < step
                        ? 'w-1.5 bg-[#7c3aed]'
                        : s.id === step
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/20'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
