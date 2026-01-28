'use client';

import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  label?: string;
  submittingLabel?: string;
}

export function SubmitButton({
  canSubmit,
  isSubmitting,
  onSubmit,
  label = 'Continue',
  submittingLabel = 'Submitting...',
}: SubmitButtonProps) {
  return (
    <button
      onClick={onSubmit}
      disabled={!canSubmit || isSubmitting}
      className={cn(
        'w-full h-11 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden',
        canSubmit && !isSubmitting
          ? 'bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
          : 'bg-white/10 text-white/40 cursor-not-allowed'
      )}
    >
      {/* Shimmer effect */}
      {canSubmit && !isSubmitting && (
        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {submittingLabel}
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}
