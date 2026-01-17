'use client';

import { X, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-[2rem]',
          'bg-[#0C0C0E]/80 backdrop-blur-2xl border border-white/10',
          'p-8 sm:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300'
        )}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 bg-[var(--purple-500)]/10 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-[var(--pink-500)]/10 blur-[80px]" />

        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative text-center">
          {/* Header Icon with Concentric Glow */}
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] opacity-20 blur-xl animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-600)] to-[var(--pink-600)] shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            Confirm Purchase
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            Review your order details below
          </p>

          {/* Premium Summary Card (Receipt Style) */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5 -m-0.5 pointer-events-none" />
            <div className="relative overflow-hidden rounded-2xl bg-[#141416]/50 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  Credits to add
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                    {package_.credits.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--purple-400)] font-bold">
                    Instant Delivery
                  </span>
                </div>
              </div>

              <div className="h-px w-full border-t border-dashed border-white/10" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-[var(--text-muted)] pb-1">
                  Total Amount
                </span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 tracking-tighter">
                  ${package_.price}
                </span>
              </div>
            </div>
          </div>

          {/* Secure Payment Notice */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-8">
            <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <p className="text-[11px] text-indigo-300/70 text-left leading-relaxed">
              Payments are handled securely. You will be redirected to complete
              your transaction.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <RylaButton
              onClick={onConfirm}
              disabled={isProcessing}
              loading={isProcessing}
              variant="glassy"
              size="lg"
              className="w-full bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-600)] border-none text-white h-12 text-base font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300"
            >
              Continue to Payment
            </RylaButton>
            <button
              onClick={onCancel}
              className="w-full py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
