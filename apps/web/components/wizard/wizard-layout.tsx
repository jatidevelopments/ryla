"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCharacterWizardStore, useWizardProgress, useCurrentStep } from "@ryla/business";
import { cn, Progress, Button } from "@ryla/ui";

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

  const isFirstStep = step === 1;
  const isLastStep = step === steps.length;

  const handleNext = () => {
    if (canProceed()) {
      if (isLastStep) {
        // Navigate to generation
        router.push(`/wizard/step-${step + 1}`);
      } else {
        nextStep();
        router.push(`/wizard/step-${step + 1}`);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      prevStep();
      router.push(`/wizard/step-${step - 1}`);
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#161619]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#121214]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          {/* Back / Cancel */}
          <button
            onClick={isFirstStep ? handleCancel : handleBack}
            className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
          >
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
            {isFirstStep ? "Cancel" : "Back"}
          </button>

          {/* Step indicator */}
          <div className="text-center">
            <div className="text-sm font-medium text-white">
              Step {step} of {steps.length}
            </div>
            <div className="text-xs text-white/50">{currentStep.title}</div>
          </div>

          {/* Empty space for alignment */}
          <div className="w-16" />
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
      </main>

      {/* Footer with navigation */}
      <footer className="sticky bottom-0 border-t border-white/10 bg-[#121214]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 p-4">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  s.id < step
                    ? "bg-[#b99cff]"
                    : s.id === step
                    ? "bg-white"
                    : "bg-white/20"
                )}
              />
            ))}
          </div>

          {/* Next button */}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] px-8"
          >
            {isLastStep ? "Generate" : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

