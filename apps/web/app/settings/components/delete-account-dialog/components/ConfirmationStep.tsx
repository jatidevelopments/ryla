'use client';

import { Button, Input, Label, DialogTitle, DialogDescription } from '@ryla/ui';

interface ConfirmationStepProps {
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  isDeleting: boolean;
  onDelete: () => void;
  onBack: () => void;
}

export function ConfirmationStep({
  confirmText,
  onConfirmTextChange,
  isDeleting,
  onDelete,
  onBack,
}: ConfirmationStepProps) {
  const isValid = confirmText.trim().toUpperCase() === 'DELETE';

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/20">
          <span className="text-2xl">⚠️</span>
        </div>
        <DialogTitle className="text-xl font-semibold text-red-400">
          Delete your account?
        </DialogTitle>
        <DialogDescription className="mt-2 text-white/50">
          This action cannot be undone
        </DialogDescription>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm text-red-200/80 text-center leading-relaxed">
          All your data, influencers, and generated images will be permanently deleted.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-white/50">
          Type <span className="font-semibold text-white">DELETE</span> to confirm
        </Label>
        <Input
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="DELETE"
          className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] text-center uppercase tracking-[0.2em] font-medium placeholder:text-white/20 focus:border-red-500/30"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
          onClick={onBack}
          disabled={isDeleting}
        >
          Back
        </Button>
        <Button
          className="flex-1 h-11 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40 transition-all"
          disabled={!isValid || isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? 'Deleting...' : 'Delete Forever'}
        </Button>
      </div>
    </div>
  );
}

