'use client';

import { cn } from '@ryla/ui';

interface ProgressDotsProps {
  step1Complete: boolean;
  step2Complete: boolean;
}

export function ProgressDots({ step1Complete, step2Complete }: ProgressDotsProps) {
  return (
    <div className="flex justify-center gap-1.5 mt-2">
      <div
        className={cn(
          'h-1.5 rounded-full transition-all duration-300',
          step1Complete ? 'w-1.5 bg-[#7c3aed]' : 'w-6 bg-white'
        )}
      />
      <div
        className={cn(
          'h-1.5 rounded-full transition-all duration-300',
          step2Complete
            ? 'w-1.5 bg-[#7c3aed]'
            : step1Complete
              ? 'w-6 bg-white'
              : 'w-1.5 bg-white/20'
        )}
      />
    </div>
  );
}

