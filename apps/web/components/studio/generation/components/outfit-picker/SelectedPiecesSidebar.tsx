'use client';

import { X } from 'lucide-react';
import { OutfitPieceCategory, OUTFIT_PIECE_CATEGORIES } from '@ryla/shared';
import { getSelectedPieces } from '../../utils/get-selected-pieces';
import type { OutfitComposition } from '@ryla/shared';

const CATEGORY_LABELS: Record<OutfitPieceCategory, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  headwear: 'Headwear',
  outerwear: 'Outerwear',
  accessory: 'Accessories',
};

interface SelectedPiecesSidebarProps {
  composition: OutfitComposition | null;
  nsfwEnabled?: boolean;
  onClearPiece: (category: OutfitPieceCategory) => void;
  onClearAll: () => void;
}

export function SelectedPiecesSidebar({
  composition,
  nsfwEnabled = false,
  onClearPiece,
  onClearAll,
}: SelectedPiecesSidebarProps) {
  const selectedPieces = getSelectedPieces(composition);

  return (
    <div className="w-64 border-r border-white/10 bg-[#0a0a0b] p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Selected</h3>
        {composition && (
          <button
            onClick={onClearAll}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {selectedPieces.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">👕</div>
          <p className="text-xs text-white/40">
            {nsfwEnabled
              ? 'No pieces selected (recommended for Adult Content)'
              : 'No pieces selected'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {OUTFIT_PIECE_CATEGORIES.map((cat) => {
            const categoryPieces = selectedPieces.filter((sp) => sp.category === cat);
            if (categoryPieces.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat]}
                </div>
                {categoryPieces.map(({ piece }) => (
                  <div
                    key={piece.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{piece.emoji}</span>
                      <span className="text-xs text-white font-medium">{piece.label}</span>
                    </div>
                    <button
                      onClick={() => onClearPiece(cat)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

