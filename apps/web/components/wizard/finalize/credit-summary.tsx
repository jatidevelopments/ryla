'use client';

import { cn } from '@ryla/ui';

interface CreditSummaryProps {
  creditCost: number;
  profileSetCost: number;
  nsfwExtraCost: number;
  balance: number;
  isLoadingCredits: boolean;
  hasEnoughCredits: boolean;
}

export function CreditSummary({
  creditCost,
  profileSetCost,
  nsfwExtraCost,
  balance,
  isLoadingCredits,
  hasEnoughCredits,
}: CreditSummaryProps) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Cost:</span>
          <span
            className={cn(
              'font-semibold text-sm',
              creditCost === 0 ? 'text-green-400' : hasEnoughCredits ? 'text-white' : 'text-red-400'
            )}
          >
            {creditCost === 0 ? 'Free' : `${creditCost} credits`}
          </span>
        </div>
        {/* Cost breakdown when multiple costs */}
        {creditCost > 0 && (profileSetCost > 0 || nsfwExtraCost > 0) && (
          <p className="text-white/40 text-xs mt-0.5">
            {profileSetCost > 0 && <span>Profile set: {profileSetCost}</span>}
            {nsfwExtraCost > 0 && <span> + NSFW: {nsfwExtraCost}</span>}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-sm">Balance:</span>
        <span
          className={cn('font-semibold text-sm', hasEnoughCredits ? 'text-green-400' : 'text-red-400')}
        >
          {isLoadingCredits ? '...' : balance}
        </span>
      </div>
    </div>
  );
}

