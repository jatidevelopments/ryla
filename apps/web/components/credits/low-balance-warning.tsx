'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@ryla/ui';
import { useCredits } from '../../lib/hooks/use-credits';
import { useSubscription } from '../../lib/hooks';

interface LowBalanceWarningProps {
  className?: string;
}

/**
 * Low Balance Warning Component
 * Shows a dismissible warning when credits are running low
 */
export function LowBalanceWarning({ className }: LowBalanceWarningProps) {
  const {
    balance,
    isLowBalance,
    isZeroBalance,
    lowBalanceWarningShown,
    dismissLowBalanceWarning,
    isDismissing,
  } = useCredits();
  const { isPro } = useSubscription();

  const [dismissed, setDismissed] = useState(false);

  // Check if warning was already shown today
  useEffect(() => {
    if (lowBalanceWarningShown) {
      const shownDate = new Date(lowBalanceWarningShown);
      const today = new Date();
      // If shown today, keep it dismissed
      if (shownDate.toDateString() === today.toDateString()) {
        setDismissed(true);
      }
    }
  }, [lowBalanceWarningShown]);

  // Don't show if not low/zero, or if dismissed
  if ((!isLowBalance && !isZeroBalance) || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    dismissLowBalanceWarning();
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 animate-in slide-in-from-top-2 fade-in duration-300',
        isZeroBalance
          ? 'bg-gradient-to-r from-red-900/40 to-red-800/40 border-red-500/30'
          : 'bg-gradient-to-r from-orange-900/40 to-orange-800/40 border-orange-500/30',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            isZeroBalance ? 'bg-red-500/20' : 'bg-orange-500/20'
          )}
        >
          {isZeroBalance ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-red-400"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-orange-400"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">
            {isZeroBalance ? 'Out of Credits' : "You're running low on credits!"}
          </h4>
          <p className="mt-1 text-sm text-white/70">
            {isZeroBalance
              ? isPro
                ? 'Buy more credits to continue generating amazing AI content.'
                : 'Upgrade to Pro to continue generating amazing AI content.'
              : isPro
              ? `You have ${balance} credits remaining. Buy more credits to keep creating.`
              : `You have ${balance} credits remaining. Upgrade to Pro for 300 monthly credits.`}
          </p>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-3">
            {isPro ? (
              <Link
                href="/buy-credits"
                className={cn(
                  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  isZeroBalance
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                )}
              >
                Buy Credits
              </Link>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    isZeroBalance
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  )}
                >
                  Upgrade Now
                </Link>
                <Link
                  href="/buy-credits"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Buy Credits
                </Link>
              </>
            )}

            {!isZeroBalance && (
              <button
                onClick={handleDismiss}
                disabled={isDismissing}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {/* Close button */}
        {!isZeroBalance && (
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

