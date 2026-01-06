'use client';

import { Button } from '@ryla/ui';

interface DetailPanelDeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DetailPanelDeleteConfirmation({
  onConfirm,
  onCancel,
}: DetailPanelDeleteConfirmationProps) {
  return (
    <div className="mx-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
      <p className="text-sm text-[var(--text-primary)] mb-3">
        Are you sure you want to delete this image?
      </p>
      <div className="flex gap-2">
        <Button
          onClick={onConfirm}
          variant="outline"
          className="flex-1 border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl"
        >
          Delete
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-[var(--border-default)] bg-[var(--bg-base)] rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

