'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useCharacterWizardStore,
  useWizardProgress,
  useCurrentStep,
} from '@ryla/business';
import { cn, Progress, Button } from '@ryla/ui';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const router = useRouter();
  const step = useCharacterWizardStore((s) => s.step);
  const steps = useCharacterWizardStore((s) => s.steps);
  const nextStep = useCharacterWizardStore((s) => s.nextStep);
  const prevStep = useCharacterWizardStore((s) => s.prevStep);
  const canProceed = useCharacterWizardStore((s) => s.canProceed);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const progress = useWizardProgress();
  const currentStep = useCurrentStep();

  const isFirstStep = step === 0 || step === 1;
  const isLastStep = step === steps.length;

  const handleNext = () => {
    if (canProceed()) {
      if (isLastStep) {
        router.push(`/wizard/step-${step + 1}`);
      } else {
        nextStep();
        router.push(`/wizard/step-${step + 1}`);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      // Go back to creation method selection
      router.push('/wizard/step-0');
    } else if (step > 1) {
      prevStep();
      router.push(`/wizard/step-${step - 1}`);
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#161619]">
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 bg-[#161619]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[500px] items-center justify-between px-4">
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

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logos/Ryla_Logo_white.png"
              alt="RYLA"
              width={80}
              height={28}
              className="h-7 w-auto"
            />
          </Link>

          {/* Step indicator */}
          <div className="text-right min-w-[60px]">
            {step > 0 && steps.length > 0 && (
              <span className="text-sm text-white/50">
                {step}/{steps.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-[500px] flex-1 flex flex-col px-4 pt-4 pb-32">
          {/* Progress bar - only show when not on step 0 */}
          {step > 0 && steps.length > 0 && (
            <div className="mb-8">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          {children}
        </div>
      </main>

      {/* Fixed Footer with Continue Button */}
      {step > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#161619] border-t border-white/5">
          <div className="mx-auto max-w-[500px] p-4">
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                'w-full h-12 rounded-xl font-bold text-base transition-all duration-200 relative overflow-hidden',
                canProceed()
                  ? 'bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              )}
            >
              {/* Shimmer effect */}
              {canProceed() && (
                <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              )}
              <span className="relative z-10">
                {isLastStep ? 'Generate' : 'Continue'}
              </span>
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
        </footer>
      )}
    </div>
  );
}
