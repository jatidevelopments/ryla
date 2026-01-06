import type {
  OutfitComposition,
  OutfitPiece,
  OutfitPieceCategory,
} from '@ryla/shared';
import { getPieceById } from '@ryla/shared';

export function getSelectedPieces(
  composition: OutfitComposition | null
): Array<{ piece: OutfitPiece; category: OutfitPieceCategory }> {
  if (!composition) return [];

  const selected: Array<{ piece: OutfitPiece; category: OutfitPieceCategory }> = [];

  if (composition.top) {
    const piece = getPieceById(composition.top);
    if (piece) selected.push({ piece, category: 'top' });
  }
  if (composition.bottom) {
    const piece = getPieceById(composition.bottom);
    if (piece) selected.push({ piece, category: 'bottom' });
  }
  if (composition.shoes) {
    const piece = getPieceById(composition.shoes);
    if (piece) selected.push({ piece, category: 'shoes' });
  }
  if (
    composition.headwear &&
    composition.headwear !== 'none' &&
    composition.headwear !== 'none-headwear'
  ) {
    const piece = getPieceById(composition.headwear);
    if (piece) selected.push({ piece, category: 'headwear' });
  }
  if (
    composition.outerwear &&
    composition.outerwear !== 'none' &&
    composition.outerwear !== 'none-outerwear'
  ) {
    const piece = getPieceById(composition.outerwear);
    if (piece) selected.push({ piece, category: 'outerwear' });
  }
  if (composition.accessories) {
    composition.accessories.forEach((id) => {
      const piece = getPieceById(id);
      if (piece) selected.push({ piece, category: 'accessory' });
    });
  }

  return selected;
}

