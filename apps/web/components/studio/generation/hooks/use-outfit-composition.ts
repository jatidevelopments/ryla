'use client';

import * as React from 'react';
import type {
  OutfitComposition,
  OutfitPiece,
  OutfitPieceCategory,
} from '@ryla/shared';
import { getCategoryPieces } from '@ryla/shared';

interface UseOutfitCompositionOptions {
  initialComposition: OutfitComposition | null;
  nsfwEnabled: boolean;
  search: string;
  activeCategory: OutfitPieceCategory | 'all' | 'presets';
  showFavoritesOnly: boolean;
  isFavorited: (id: string) => boolean;
}

export function useOutfitComposition({
  initialComposition,
  nsfwEnabled,
  search,
  activeCategory,
  showFavoritesOnly,
  isFavorited,
}: UseOutfitCompositionOptions) {
  const [composition, setComposition] = React.useState<OutfitComposition | null>(
    initialComposition
  );

  // Get available pieces for current category
  const availablePieces = React.useMemo(() => {
    let pieces: OutfitPiece[] = [];

    if (activeCategory === 'all') {
      // Show all pieces
      pieces = getCategoryPieces('top', nsfwEnabled)
        .concat(getCategoryPieces('bottom', nsfwEnabled))
        .concat(getCategoryPieces('shoes', nsfwEnabled))
        .concat(getCategoryPieces('headwear', nsfwEnabled))
        .concat(getCategoryPieces('outerwear', nsfwEnabled))
        .concat(getCategoryPieces('accessory', nsfwEnabled));
    } else if (activeCategory !== 'presets') {
      pieces = getCategoryPieces(activeCategory, nsfwEnabled);
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      pieces = pieces.filter((piece) =>
        piece.label.toLowerCase().includes(searchLower)
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      pieces = pieces.filter((piece) => isFavorited(piece.id));
    }

    return pieces;
  }, [activeCategory, search, nsfwEnabled, showFavoritesOnly, isFavorited]);

  const handlePieceSelect = React.useCallback(
    (piece: OutfitPiece) => {
      setComposition((prev) => {
        const newComp: OutfitComposition = { ...prev };

        if (piece.category === 'accessory') {
          // Accessories: toggle (multiple allowed)
          const current = newComp.accessories || [];
          const index = current.indexOf(piece.id);
          if (index >= 0) {
            // Remove
            newComp.accessories = current.filter((id) => id !== piece.id);
          } else {
            // Add
            newComp.accessories = [...current, piece.id];
          }
        } else {
          // Single selection categories: replace
          if (piece.category === 'top') newComp.top = piece.id;
          else if (piece.category === 'bottom') newComp.bottom = piece.id;
          else if (piece.category === 'shoes') newComp.shoes = piece.id;
          else if (piece.category === 'headwear') newComp.headwear = piece.id;
          else if (piece.category === 'outerwear') newComp.outerwear = piece.id;
        }

        return newComp;
      });
    },
    []
  );

  const handleClearPiece = React.useCallback((category: OutfitPieceCategory) => {
    setComposition((prev) => {
      if (!prev) return null;

      const newComp: OutfitComposition = { ...prev };

      if (category === 'top') delete newComp.top;
      else if (category === 'bottom') delete newComp.bottom;
      else if (category === 'shoes') delete newComp.shoes;
      else if (category === 'headwear') delete newComp.headwear;
      else if (category === 'outerwear') delete newComp.outerwear;
      else if (category === 'accessory') newComp.accessories = [];

      // Return null if composition is empty
      const hasAny =
        newComp.top ||
        newComp.bottom ||
        newComp.shoes ||
        newComp.headwear ||
        newComp.outerwear ||
        (newComp.accessories && newComp.accessories.length > 0);

      return hasAny ? newComp : null;
    });
  }, []);

  const handleClearAll = React.useCallback(() => {
    setComposition(null);
  }, []);

  const isPieceSelected = React.useCallback(
    (piece: OutfitPiece): boolean => {
      if (!composition) return false;

      if (piece.category === 'accessory') {
        return composition.accessories?.includes(piece.id) || false;
      }

      if (piece.category === 'top') return composition.top === piece.id;
      if (piece.category === 'bottom') return composition.bottom === piece.id;
      if (piece.category === 'shoes') return composition.shoes === piece.id;
      if (piece.category === 'headwear') return composition.headwear === piece.id;
      if (piece.category === 'outerwear')
        return composition.outerwear === piece.id;

      return false;
    },
    [composition]
  );

  return {
    composition,
    setComposition,
    availablePieces,
    handlePieceSelect,
    handleClearPiece,
    handleClearAll,
    isPieceSelected,
  };
}

