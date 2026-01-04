/**
 * Migration utilities for outfit system
 * Converts legacy string outfits to new OutfitComposition format
 */

import { OutfitComposition } from './types';
import { OUTFIT_OPTIONS } from './outfit-options';
import { OUTFIT_PIECES } from './outfit-pieces';

/**
 * Migrate legacy string outfit to OutfitComposition
 * Attempts to map old preset outfits to new piece-based compositions
 */
export function migrateOutfitToString(outfit: string | null | OutfitComposition): string | null {
  if (!outfit) return null;
  if (typeof outfit === 'string') return outfit;
  
  // Convert composition to string for backward compatibility
  // This is a simplified conversion - in production, you might want more sophisticated mapping
  const comp = outfit as OutfitComposition;
  const parts: string[] = [];
  
  if (comp.top) {
    const piece = OUTFIT_PIECES.find(p => p.id === comp.top);
    if (piece) parts.push(piece.label.toLowerCase().replace(/\s+/g, '-'));
  }
  if (comp.bottom) {
    const piece = OUTFIT_PIECES.find(p => p.id === comp.bottom);
    if (piece) parts.push(piece.label.toLowerCase().replace(/\s+/g, '-'));
  }
  if (comp.shoes) {
    const piece = OUTFIT_PIECES.find(p => p.id === comp.shoes);
    if (piece) parts.push(piece.label.toLowerCase().replace(/\s+/g, '-'));
  }
  
  return parts.length > 0 ? parts.join('-') : null;
}

/**
 * Attempt to convert legacy string outfit to OutfitComposition
 * This is a best-effort mapping - some outfits may not map perfectly
 */
export function migrateStringToOutfit(outfit: string | null): OutfitComposition | null {
  if (!outfit) return null;
  
  // Try to find exact match in old outfit options
  const oldOutfit = OUTFIT_OPTIONS.find(
    (o) => o.label.toLowerCase().replace(/\s+/g, '-') === outfit
  );
  
  if (!oldOutfit) {
    // If not found, try to parse as piece IDs (for new format stored as string)
    const parts = outfit.split('-');
    const comp: OutfitComposition = {};
    
    // Try to match parts to piece IDs
    for (const part of parts) {
      const piece = OUTFIT_PIECES.find(p => p.id === part);
      if (piece) {
        if (piece.category === 'top') comp.top = piece.id;
        else if (piece.category === 'bottom') comp.bottom = piece.id;
        else if (piece.category === 'shoes') comp.shoes = piece.id;
        else if (piece.category === 'headwear') comp.headwear = piece.id;
        else if (piece.category === 'outerwear') comp.outerwear = piece.id;
        else if (piece.category === 'accessory') {
          if (!comp.accessories) comp.accessories = [];
          comp.accessories.push(piece.id);
        }
      }
    }
    
    const hasAny = comp.top || comp.bottom || comp.shoes || comp.headwear || comp.outerwear || 
                  (comp.accessories && comp.accessories.length > 0);
    return hasAny ? comp : null;
  }
  
  // Map old preset outfits to approximate compositions
  // This is a simplified mapping - you can enhance this with better logic
  const mapping: Record<string, Partial<OutfitComposition>> = {
    'casual-streetwear': { top: 't-shirt', bottom: 'jeans', shoes: 'sneakers' },
    'athleisure': { top: 'tank-top', bottom: 'leggings', shoes: 'sneakers' },
    'yoga': { top: 'sports-bra', bottom: 'yoga-pants', shoes: 'barefoot' },
    'jeans': { bottom: 'jeans', shoes: 'sneakers' },
    'tank-top': { top: 'tank-top' },
    'crop-top': { top: 'crop-top' },
    'hoodie': { top: 'hoodie-top', outerwear: 'hoodie-outerwear' },
    'sweatpants': { bottom: 'sweatpants', shoes: 'sneakers' },
    'denim-jacket': { outerwear: 'denim-jacket' },
    'sneakers-leggings': { bottom: 'leggings', shoes: 'sneakers' },
    'date-night-glam': { bottom: 'cocktail-dress', shoes: 'high-heels' },
    'cocktail-dress': { bottom: 'cocktail-dress', shoes: 'high-heels' },
    'mini-skirt': { bottom: 'mini-skirt', shoes: 'high-heels' },
    'dress': { bottom: 'dress', shoes: 'high-heels' },
    'summer-chic': { top: 'blouse', bottom: 'midi-skirt', shoes: 'sandals' },
    'evening-gown': { bottom: 'evening-gown', shoes: 'stilettos' },
    'bodycon-dress': { bottom: 'bodycon-dress', shoes: 'high-heels' },
    'high-heels-dress': { bottom: 'dress', shoes: 'high-heels' },
    'formal-attire': { top: 'blouse', bottom: 'pencil-skirt', shoes: 'high-heels' },
    'red-carpet': { bottom: 'evening-gown', shoes: 'stilettos' },
    'bikini': { top: 'bikini-top', bottom: 'bikini-bottom' },
    'lingerie': { top: 'bra', bottom: 'panties' },
    'swimsuit': { top: 'bikini-top', bottom: 'swimsuit-bottom' },
    'nightgown': { top: 'nightgown' },
    'leotard': { top: 'leotard' },
    'teddy': { top: 'teddy' },
    'babydoll': { top: 'babydoll' },
    'bodysuit': { top: 'bodysuit' },
    'chemise': { top: 'chemise' },
    'slip': { top: 'slip' },
  };
  
  const mapped = mapping[outfit];
  if (mapped) {
    return {
      top: mapped.top,
      bottom: mapped.bottom,
      shoes: mapped.shoes,
      headwear: mapped.headwear,
      outerwear: mapped.outerwear,
      accessories: mapped.accessories,
    } as OutfitComposition;
  }
  
  // Default: return null (user will need to recompose)
  return null;
}

