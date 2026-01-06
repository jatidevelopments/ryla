'use client';

import * as React from 'react';
import type { OutfitComposition } from '@ryla/shared';
import type { GenerationSettings } from '../types';

interface UseOutfitDisplayOptions {
  outfit: GenerationSettings['outfit'];
}

interface UseOutfitDisplayReturn {
  outfitDisplayText: string;
  hasOutfitComposition: boolean;
}

/**
 * Hook for computing outfit display text and composition status.
 * Handles both legacy string format and new OutfitComposition format.
 */
export function useOutfitDisplay({
  outfit,
}: UseOutfitDisplayOptions): UseOutfitDisplayReturn {
  const getOutfitDisplayText = React.useCallback((): string => {
    if (!outfit) return 'Outfit';

    // Legacy string format
    if (typeof outfit === 'string') {
      // Simple label extraction
      return outfit
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    // New composition format
    const comp = outfit as OutfitComposition;
    const pieceCount = [comp.top, comp.bottom, comp.shoes].filter(
      Boolean
    ).length;
    if (pieceCount > 0) {
      return pieceCount > 2 ? `Custom (${pieceCount})` : 'Custom';
    }
    return 'Outfit';
  }, [outfit]);

  const outfitDisplayText = React.useMemo(
    () => getOutfitDisplayText(),
    [getOutfitDisplayText]
  );

  const hasOutfitComposition = React.useMemo(
    () => outfit !== null && typeof outfit === 'object',
    [outfit]
  );

  return {
    outfitDisplayText,
    hasOutfitComposition,
  };
}

