'use client';

import Link from 'next/link';
import { Button, DialogTitle, DialogDescription } from '@ryla/ui';

interface RetentionOfferStepProps {
  onContinue: () => void;
  onOfferClick: () => void;
}

export function RetentionOfferStep({ onContinue, onOfferClick }: RetentionOfferStepProps) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9333EA] to-[#EC4899] shadow-lg shadow-purple-500/25">
          <span className="text-2xl">💜</span>
        </div>
        <DialogTitle className="text-xl font-semibold">Before you go...</DialogTitle>
        <DialogDescription className="mt-2 text-white/50">
          We'd love to keep you around!
        </DialogDescription>
      </div>

      <div className="rounded-2xl border border-[#9333EA]/30 bg-gradient-to-b from-[#9333EA]/10 to-transparent p-5 text-center">
        <p className="text-base font-semibold text-white">Get 50% off your next month</p>
        <p className="mt-1 text-sm text-white/50">Stay with us at half the price</p>
        <Link href="/pricing?offer=retention50" onClick={onOfferClick}>
          <Button className="mt-4 w-full h-11 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            Claim 50% Off
          </Button>
        </Link>
      </div>

      <button
        onClick={onContinue}
        className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors py-2"
      >
        No thanks, continue to delete
      </button>
    </div>
  );
}

