'use client';

import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  currentStep: 1 | 2 | 3;
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete?: boolean;
}

export function ProgressDots({
  currentStep,
  step1Complete,
  step2Complete,
  step3Complete = false,
}: ProgressDotsProps) {
  return (
    <div className="flex justify-center gap-1.5 mt-2">
      <div
        className={cn(
          'h-1.5 rounded-full transition-all duration-300',
          step1Complete
            ? 'w-1.5 bg-[#7c3aed]'
            : currentStep === 1
            ? 'w-6 bg-white'
            : 'w-1.5 bg-white/20'
        )}
      />
      <div
        className={cn(
          'h-1.5 rounded-full transition-all duration-300',
          step2Complete
            ? 'w-1.5 bg-[#7c3aed]'
            : currentStep === 2
            ? 'w-6 bg-white'
            : 'w-1.5 bg-white/20'
        )}
      />
      {step3Complete !== undefined && (
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            step3Complete
              ? 'w-1.5 bg-[#7c3aed]'
              : currentStep === 3
              ? 'w-6 bg-white'
              : 'w-1.5 bg-white/20'
          )}
        />
      )}
    </div>
  );
}
