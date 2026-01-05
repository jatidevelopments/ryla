'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface TutorialStepProps {
  /** Current step data */
  step: {
    id: string;
    message: string;
    title?: string;
    showSkip?: boolean;
  };
  /** Current step number (1-based) */
  stepNumber: number;
  /** Total number of steps */
  totalSteps: number;
  /** Callback when user clicks "Got it" */
  onNext: () => void;
  /** Callback when user clicks "Skip tutorial" */
  onSkip: () => void;
  /** Whether this is the last step */
  isLastStep: boolean;
}

/**
 * TutorialStep - Individual step display component
 * Matches the reference design with step counter, message, button, and skip link
 */
export function TutorialStep({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onSkip,
  isLastStep,
}: TutorialStepProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    },
    [onNext, onSkip]
  );

  return (
    <div
      className="flex flex-col gap-3"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-message"
      aria-modal="true"
      aria-live="polite"
    >
      {/* Step Indicator - "1 OF 5" format */}
      <div className="text-sm font-medium text-white/60 uppercase tracking-wider">
        {stepNumber} OF {totalSteps}
      </div>

      {/* Message - Large bold text */}
      <p
        id="tutorial-message"
        className="text-2xl font-bold text-white leading-tight"
      >
        {step.message}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        {/* Got it button - RYLA gradient */}
        <button
          onClick={onNext}
          className={cn(
            'w-full py-3 px-6 rounded-full',
            'bg-gradient-to-r from-purple-500 to-pink-500',
            'hover:from-purple-400 hover:to-pink-400',
            'text-white font-semibold text-base',
            'transition-all duration-200',
            'shadow-lg shadow-purple-500/30',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1d]'
          )}
          aria-label={isLastStep ? 'Complete tutorial' : 'Got it, proceed to next step'}
        >
          Got it
        </button>

        {/* Skip tutorial link */}
        {step.showSkip !== false && (
          <button
            onClick={onSkip}
            className="text-sm text-white/50 hover:text-white/80 underline underline-offset-2 transition-colors text-center py-1"
            aria-label="Skip tutorial"
          >
            Skip tutorial
          </button>
        )}
      </div>
    </div>
  );
}
