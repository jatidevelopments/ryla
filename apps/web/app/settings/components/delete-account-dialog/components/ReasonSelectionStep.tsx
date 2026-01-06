'use client';

import { DialogTitle, DialogDescription } from '@ryla/ui';
import { REASON_OPTIONS, type DeleteReason } from '../constants';

interface ReasonSelectionStepProps {
  onSelectReason: (reason: DeleteReason) => void;
  onBack: () => void;
}

export function ReasonSelectionStep({ onSelectReason, onBack }: ReasonSelectionStepProps) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <DialogTitle className="text-xl font-semibold">Why are you leaving?</DialogTitle>
        <DialogDescription className="mt-2 text-white/50">
          Your feedback helps us improve
        </DialogDescription>
      </div>

      <div className="space-y-2">
        {REASON_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectReason(option.value)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-left text-sm text-white/80 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-base">
              {option.icon}
            </span>
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors py-2"
      >
        ← Go back
      </button>
    </div>
  );
}

