'use client';

import { cn } from '@ryla/ui';

interface CreditSummaryProps {
  /** Total credit cost for entire wizard */
  totalCost: number;
  /** Cost for base images (80 credits) */
  baseImagesCost: number;
  /** Cost for profile picture set (120 credits) */
  profileSetCost: number;
  /** Extra cost for NSFW content (50 credits) */
  nsfwExtraCost: number;
  /** Cost for LoRA training (optional) */
  loraTrainingCost?: number;
  /** Current credit balance */
  balance: number;
  /** Whether credits are loading */
  isLoadingCredits: boolean;
  /** Whether user has enough credits for total cost */
  hasEnoughCredits: boolean;
}

export function CreditSummary({
  totalCost,
  baseImagesCost,
  profileSetCost,
  nsfwExtraCost,
  loraTrainingCost = 0,
  balance,
  isLoadingCredits,
  hasEnoughCredits,
}: CreditSummaryProps) {
  // Build cost breakdown items
  const costItems: Array<{ label: string; cost: number }> = [];

  if (baseImagesCost > 0) {
    costItems.push({ label: 'Base Images', cost: baseImagesCost });
  }
  if (profileSetCost > 0) {
    costItems.push({ label: 'Profile Set', cost: profileSetCost });
  }
  if (nsfwExtraCost > 0) {
    costItems.push({ label: 'Adult Content', cost: nsfwExtraCost });
  }
  if (loraTrainingCost > 0) {
    costItems.push({ label: 'LoRA Training', cost: loraTrainingCost });
  }

  return (
    <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-purple-400"
        >
          <path
            fillRule="evenodd"
            d="M12.577 4.878a.75.75 0 01.919-.53 4.5 4.5 0 012.156 2.156.75.75 0 11-1.39.388 3 3 0 00-1.437-1.437.75.75 0 01-.53-.919zM5.5 8.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zm4.5-3a3 3 0 100 6 3 3 0 000-6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-white/80 text-sm font-medium">
          Credit Summary
        </span>
      </div>

      {/* Cost breakdown */}
      {costItems.length > 0 && (
        <div className="space-y-1.5 mb-3 pb-3 border-b border-white/10">
          {costItems.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-white/60">{item.label}</span>
              <span className="text-white/80">{item.cost} credits</span>
            </div>
          ))}
        </div>
      )}

      {/* Total and balance */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-white/60 text-xs">Total Cost</span>
          <span
            className={cn(
              'font-bold text-lg',
              totalCost === 0
                ? 'text-green-400'
                : hasEnoughCredits
                ? 'text-white'
                : 'text-red-400'
            )}
          >
            {totalCost === 0 ? 'Free' : `${totalCost} credits`}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-white/60 text-xs">Your Balance</span>
          <span
            className={cn(
              'font-bold text-lg',
              hasEnoughCredits ? 'text-green-400' : 'text-red-400'
            )}
          >
            {isLoadingCredits ? '...' : `${balance} credits`}
          </span>
        </div>
      </div>

      {/* Insufficient credits warning */}
      {!hasEnoughCredits && !isLoadingCredits && (
        <div className="mt-3 pt-3 border-t border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>Need {totalCost - balance} more credits</span>
          </div>
        </div>
      )}
    </div>
  );
}
