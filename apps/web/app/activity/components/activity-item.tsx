'use client';

import Image from 'next/image';
import type { ActivityItem as ActivityItemType } from '@ryla/shared';
import { getActivityMeta, estimateCreditCost, formatRelativeTime } from '../utils';

interface ActivityItemProps {
  item: ActivityItemType;
  onClick?: () => void;
}

export function ActivityItem({ item, onClick }: ActivityItemProps) {
  const meta = getActivityMeta(item);
  const isGeneration = item.sourceType === 'generation_job';
  const isCreditTransaction = item.sourceType === 'credit_transaction';
  const isClickable = isGeneration && item.characterId && item.thumbnailUrl;

  // Estimate credit cost for generations
  const estimatedCost = isGeneration
    ? estimateCreditCost(item.qualityMode, item.imageCount)
    : null;

  // For credit transactions, get the absolute amount for display
  const creditAmount =
    isCreditTransaction && item.creditAmount ? Math.abs(item.creditAmount) : null;
  const isCreditSpent = isCreditTransaction && item.type === 'credits_spent';

  const content = (
    <>
      {/* For generations: Always show thumbnail if available, otherwise icon */}
      {isGeneration ? (
        item.thumbnailUrl ? (
          <div className="shrink-0">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors">
              <Image
                src={item.thumbnailUrl}
                alt="Generated image"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-white/5">
            {meta.icon}
          </div>
        )
      ) : (
        /* For credit transactions: Show icon */
        <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-white/5">
          {meta.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--text-primary)] font-medium truncate">
            {meta.label}
          </span>
          {/* Non-credit detail badges (e.g., "1 image") */}
          {meta.detail && !isCreditSpent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)]">
              {meta.detail}
            </span>
          )}
          {/* Credit cost badge for generations */}
          {estimatedCost !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">
              -{estimatedCost} credits
            </span>
          )}
          {/* Credit amount badge for credit transactions (spent) - same orange style */}
          {isCreditSpent && creditAmount !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium">
              -{creditAmount} credits
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
            {item.description}
          </p>
        )}
        {/* Click hint for clickable items */}
        {isClickable && (
          <p className="text-xs text-purple-400/70 mt-1 hidden sm:block">
            Click to open in Studio
          </p>
        )}
      </div>

      {/* Balance after - show for both credit transactions AND generations */}
      {item.balanceAfter !== null && item.balanceAfter !== undefined && (
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-xs text-[var(--text-muted)]">Balance</span>
          <span className="text-sm font-mono text-[var(--text-secondary)]">
            {item.balanceAfter}
          </span>
        </div>
      )}

      {/* Timestamp */}
      <div className="shrink-0 text-right">
        <span className="text-xs text-[var(--text-muted)]">
          {formatRelativeTime(item.occurredAt)}
        </span>
      </div>

      {/* Arrow indicator for clickable */}
      {isClickable && (
        <div className="shrink-0 hidden sm:block">
          <svg
            className="w-5 h-5 text-[var(--text-muted)] group-hover:text-purple-400 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </>
  );

  if (isClickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl hover:border-purple-500/50 hover:bg-white/[0.02] transition-all text-left group cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl transition-all">
      {content}
    </div>
  );
}

