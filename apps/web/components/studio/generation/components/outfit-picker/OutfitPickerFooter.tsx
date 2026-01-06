'use client';

import { Save } from 'lucide-react';
import type { OutfitComposition } from '@ryla/shared';
import { getSelectedPieces } from '../../utils/get-selected-pieces';

interface OutfitPickerFooterProps {
  composition: OutfitComposition | null;
  selectedPiecesCount: number;
  nsfwEnabled?: boolean;
  influencerId?: string;
  onSave: () => void;
  onCancel: () => void;
  onApply: () => void;
}

export function OutfitPickerFooter({
  composition,
  selectedPiecesCount,
  nsfwEnabled = false,
  influencerId,
  onSave,
  onCancel,
  onApply,
}: OutfitPickerFooterProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0d0d0f]">
      <div className="flex items-center gap-3">
        {selectedPiecesCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">
              {selectedPiecesCount} piece{selectedPiecesCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        ) : (
          <span className="text-white/40 text-sm">
            {nsfwEnabled
              ? 'No pieces (recommended for Adult Content)'
              : 'No pieces selected'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {influencerId && composition && (
          <button
            onClick={onSave}
            className="px-4 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        )}
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

