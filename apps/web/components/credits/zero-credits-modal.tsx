'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useSubscription } from '../../lib/hooks';

interface ZeroCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded?: number;
  currentBalance?: number;
}

/**
 * Zero Credits Modal Component
 * Shows when user tries to generate without enough credits
 */
export function ZeroCreditsModal({
  isOpen,
  onClose,
  creditsNeeded = 1,
  currentBalance = 0,
}: ZeroCreditsModalProps) {
  const { isPro } = useSubscription();

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 fade-in duration-200">
        <div className="rounded-2xl border border-white/10 bg-[#1a1a1c] p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-red-400"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.21z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Out of Credits</h3>
              <p className="text-sm text-white/60">
                You need {creditsNeeded} credits but only have {currentBalance}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            <p className="text-sm text-white/70">
              {isPro
                ? 'Purchase a credit pack to continue creating amazing AI influencer content.'
                : 'Upgrade your plan to continue creating amazing AI influencer content.'}
            </p>

            {/* Plan/Credit Recommendation */}
            {isPro ? (
              <div className="mt-4 rounded-xl border border-[var(--purple-500)]/30 bg-gradient-to-r from-[var(--purple-900)]/40 to-[var(--purple-800)]/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Credit Pack</h4>
                    <p className="text-sm text-white/60">One-time purchase</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">From $10</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-[var(--purple-500)]/30 bg-gradient-to-r from-[var(--purple-900)]/40 to-[var(--purple-800)]/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Pro Plan</h4>
                    <p className="text-sm text-white/60">8,000 credits/month</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">$49</span>
                    <span className="text-sm text-white/60">/mo</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            {isPro ? (
              <>
                <Link
                  href="/buy-credits"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  Buy Credit Pack
                </Link>

                <button
                  onClick={onClose}
                  className="text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Maybe later
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  View Subscription Plans
                </Link>

                <Link
                  href="/buy-credits"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Buy Credit Pack
                </Link>

                <button
                  onClick={onClose}
                  className="text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

