'use client';

import { cn } from '@ryla/ui';

interface GenerateButtonProps {
  creditCost: number;
  balance: number;
  hasEnoughCredits: boolean;
  isLoadingCredits: boolean;
  onGenerate: () => void;
}

export function GenerateButton({
  creditCost,
  balance,
  hasEnoughCredits,
  isLoadingCredits,
  onGenerate,
}: GenerateButtonProps) {
  return (
    <div className="w-full">
      {/* Credit info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Cost:</span>
          <span
            className={cn(
              'font-semibold text-sm',
              hasEnoughCredits ? 'text-white' : 'text-red-400'
            )}
          >
            {creditCost} credits
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Balance:</span>
          <span
            className={cn(
              'font-semibold text-sm',
              hasEnoughCredits ? 'text-green-400' : 'text-red-400'
            )}
          >
            {isLoadingCredits ? '...' : balance}
          </span>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoadingCredits}
        className={cn(
          'w-full h-14 rounded-xl font-bold text-base shadow-lg transition-all relative overflow-hidden group',
          hasEnoughCredits
            ? 'bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-purple-500/30 hover:shadow-purple-500/50'
            : 'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white shadow-red-500/30 hover:shadow-red-500/50'
        )}
      >
        <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {hasEnoughCredits ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create AI Influencer
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Insufficient Credits
            </>
          )}
        </span>
      </button>

      {!hasEnoughCredits && (
        <p className="text-red-400/80 text-xs text-center mt-3">
          You need {creditCost - balance} more credits to generate
        </p>
      )}
    </div>
  );
}

