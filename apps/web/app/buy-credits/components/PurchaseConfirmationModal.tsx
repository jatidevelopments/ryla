'use client';

import { X, Sparkles } from 'lucide-react';
import { RylaButton, cn } from '@ryla/ui';
import type { CreditPackage } from '@ryla/shared';

interface PurchaseConfirmationModalProps {
  package_: CreditPackage;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PurchaseConfirmationModal({
  package_,
  isProcessing,
  onConfirm,
  onCancel,
}: PurchaseConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl',
          'bg-[var(--bg-elevated)] border border-[var(--border-default)]',
          'p-6 sm:p-8 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
            <Sparkles className="h-7 w-7 text-[var(--purple-400)]" />
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Confirm Purchase
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            You&apos;re about to purchase credits
          </p>

          {/* Summary card */}
          <div className="p-5 rounded-xl bg-white/5 border border-[var(--border-default)] mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-secondary)]">
                Credits
              </span>
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {package_.credits}
              </span>
            </div>
            <div className="h-px bg-[var(--border-default)] mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">
                Total
              </span>
              <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                ${package_.price}
              </span>
            </div>
          </div>

          {/* Payment notice */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
            <p className="text-blue-300/80 text-xs">
              You will be redirected to our secure payment page to complete your
              purchase.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <RylaButton
              onClick={onConfirm}
              disabled={isProcessing}
              loading={isProcessing}
              variant="glassy"
              className="w-full"
            >
              Continue to Payment
            </RylaButton>
            <RylaButton
              onClick={onCancel}
              variant="ghost"
              className="w-full text-[var(--text-muted)]"
            >
              Cancel
            </RylaButton>
          </div>
        </div>
      </div>
    </div>
  );
}
