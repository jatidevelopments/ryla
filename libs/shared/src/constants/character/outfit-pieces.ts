/**
 * Outfit pieces for multi-piece outfit composition
 * Organized by piece category (Top, Bottom, Shoes, Headwear, Outerwear, Accessories)
 * Each piece can be selected individually to create custom outfit combinations
 */

import { OutfitPiece, OutfitPieceCategory, OutfitComposition } from './types';

export const OUTFIT_PIECES: OutfitPiece[] = [
  // ==================== TOPS ====================
  // Casual Tops
  { id: 'tank-top', label: 'Tank Top', emoji: '👕', category: 'top', thumbnail: '/outfit-pieces/tank-top.webp' },
  { id: 'crop-top', label: 'Crop Top', emoji: '👚', category: 'top', thumbnail: '/outfit-pieces/crop-top.webp' },
  { id: 't-shirt', label: 'T-Shirt', emoji: '👕', category: 'top', thumbnail: '/outfit-pieces/t-shirt.webp' },
  { id: 'long-sleeve', label: 'Long Sleeve', emoji: '👔', category: 'top', thumbnail: '/outfit-pieces/long-sleeve.webp' },
  { id: 'sweater', label: 'Sweater', emoji: '🧥', category: 'top', thumbnail: '/outfit-pieces/sweater.webp' },
  { id: 'hoodie-top', label: 'Hoodie', emoji: '🧥', category: 'top', thumbnail: '/outfit-pieces/hoodie-top.webp' },
  { id: 'blouse', label: 'Blouse', emoji: '👔', category: 'top', thumbnail: '/outfit-pieces/blouse.webp' },
  { id: 'shirt', label: 'Shirt', emoji: '👔', category: 'top', thumbnail: '/outfit-pieces/shirt.webp' },
  { id: 'tube-top', label: 'Tube Top', emoji: '👚', category: 'top', thumbnail: '/outfit-pieces/tube-top.webp' },
  { id: 'halter-top', label: 'Halter Top', emoji: '👚', category: 'top', thumbnail: '/outfit-pieces/halter-top.webp' },
  
  // Intimate Tops
  { id: 'bra', label: 'Bra', emoji: '💋', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/bra.webp' },
  { id: 'sports-bra', label: 'Sports Bra', emoji: '💋', category: 'top', thumbnail: '/outfit-pieces/sports-bra.webp' },
  { id: 'bikini-top', label: 'Bikini Top', emoji: '👙', category: 'top', thumbnail: '/outfit-pieces/bikini-top.webp' },
  { id: 'bandeau', label: 'Bandeau', emoji: '👙', category: 'top', thumbnail: '/outfit-pieces/bandeau.webp' },
  { id: 'corset-top', label: 'Corset', emoji: '🎀', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/corset-top.webp' },
  { id: 'cage-bra', label: 'Cage Bra', emoji: '🖤', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/cage-bra.webp' },
  { id: 'pasties', label: 'Pasties', emoji: '✨', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/pasties.webp' },
  
  // Adult Content Tops
  { id: 'nude-top', label: 'Topless', emoji: '🔥', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/nude-top.webp' },
  { id: 'see-through-top', label: 'See-Through Top', emoji: '🔥', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/see-through-top.webp' },
  { id: 'wet-t-shirt', label: 'Wet T-Shirt', emoji: '💦', category: 'top', isAdult: true, thumbnail: '/outfit-pieces/wet-t-shirt.webp' },
  
  // ==================== BOTTOMS ====================
  // Casual Bottoms
  { id: 'jeans', label: 'Jeans', emoji: '👖', category: 'bottom', thumbnail: '/outfit-pieces/jeans.webp' },
  { id: 'shorts', label: 'Shorts', emoji: '🩳', category: 'bottom', thumbnail: '/outfit-pieces/shorts.webp' },
  { id: 'sweatpants', label: 'Sweatpants', emoji: '👖', category: 'bottom', thumbnail: '/outfit-pieces/sweatpants.webp' },
  { id: 'leggings', label: 'Leggings', emoji: '👖', category: 'bottom', thumbnail: '/outfit-pieces/leggings.webp' },
  { id: 'cargo-pants', label: 'Cargo Pants', emoji: '👖', category: 'bottom', thumbnail: '/outfit-pieces/cargo-pants.webp' },
  { id: 'trousers', label: 'Trousers', emoji: '👖', category: 'bottom', thumbnail: '/outfit-pieces/trousers.webp' },
  { id: 'yoga-pants', label: 'Yoga Pants', emoji: '🧘', category: 'bottom', thumbnail: '/outfit-pieces/yoga-pants.webp' },
  
  // Skirts & Dresses
  { id: 'mini-skirt', label: 'Mini Skirt', emoji: '🩳', category: 'bottom', thumbnail: '/outfit-pieces/mini-skirt.webp' },
  { id: 'midi-skirt', label: 'Midi Skirt', emoji: '🩳', category: 'bottom', thumbnail: '/outfit-pieces/midi-skirt.webp' },
  { id: 'maxi-skirt', label: 'Maxi Skirt', emoji: '🩳', category: 'bottom', thumbnail: '/outfit-pieces/maxi-skirt.webp' },
  { id: 'pencil-skirt', label: 'Pencil Skirt', emoji: '🩳', category: 'bottom', thumbnail: '/outfit-pieces/pencil-skirt.webp' },
  { id: 'dress', label: 'Dress', emoji: '👗', category: 'bottom', thumbnail: '/outfit-pieces/dress.webp' },
  { id: 'bodycon-dress', label: 'Bodycon Dress', emoji: '👗', category: 'bottom', thumbnail: '/outfit-pieces/bodycon-dress.webp' },
  { id: 'cocktail-dress', label: 'Cocktail Dress', emoji: '👗', category: 'bottom', thumbnail: '/outfit-pieces/cocktail-dress.webp' },
  { id: 'evening-gown', label: 'Evening Gown', emoji: '✨', category: 'bottom', thumbnail: '/outfit-pieces/evening-gown.webp' },
  
  // Intimate Bottoms
  { id: 'panties', label: 'Panties', emoji: '💋', category: 'bottom', isAdult: true, thumbnail: '/outfit-pieces/panties.webp' },
  { id: 'thong', label: 'Thong', emoji: '🔥', category: 'bottom', isAdult: true, thumbnail: '/outfit-pieces/thong.webp' },
  { id: 'bikini-bottom', label: 'Bikini Bottom', emoji: '👙', category: 'bottom', thumbnail: '/outfit-pieces/bikini-bottom.webp' },
  { id: 'swimsuit-bottom', label: 'Swimsuit', emoji: '🩱', category: 'bottom', thumbnail: '/outfit-pieces/swimsuit-bottom.webp' },
  { id: 'g-string', label: 'G-String', emoji: '🔥', category: 'bottom', isAdult: true, thumbnail: '/outfit-pieces/g-string.webp' },
  
  // Adult Content Bottoms
  { id: 'nude-bottom', label: 'Bottomless', emoji: '🔥', category: 'bottom', isAdult: true, thumbnail: '/outfit-pieces/nude-bottom.webp' },
  { id: 'see-through-bottom', label: 'See-Through Bottom', emoji: '🔥', category: 'bottom', isAdult: true, thumbnail: '/outfit-pieces/see-through-bottom.webp' },
  
  // ==================== SHOES ====================
  { id: 'sneakers', label: 'Sneakers', emoji: '👟', category: 'shoes', thumbnail: '/outfit-pieces/sneakers.webp' },
  { id: 'high-heels', label: 'High Heels', emoji: '👠', category: 'shoes', thumbnail: '/outfit-pieces/high-heels.webp' },
  { id: 'boots', label: 'Boots', emoji: '👢', category: 'shoes', thumbnail: '/outfit-pieces/boots.webp' },
  { id: 'sandals', label: 'Sandals', emoji: '👡', category: 'shoes', thumbnail: '/outfit-pieces/sandals.webp' },
  { id: 'flats', label: 'Flats', emoji: '🥿', category: 'shoes', thumbnail: '/outfit-pieces/flats.webp' },
  { id: 'ankle-boots', label: 'Ankle Boots', emoji: '👢', category: 'shoes', thumbnail: '/outfit-pieces/ankle-boots.webp' },
  { id: 'platform-heels', label: 'Platform Heels', emoji: '👠', category: 'shoes', thumbnail: '/outfit-pieces/platform-heels.webp' },
  { id: 'stilettos', label: 'Stilettos', emoji: '👠', category: 'shoes', thumbnail: '/outfit-pieces/stilettos.webp' },
  { id: 'wedges', label: 'Wedges', emoji: '👡', category: 'shoes', thumbnail: '/outfit-pieces/wedges.webp' },
  { id: 'slippers', label: 'Slippers', emoji: '🩴', category: 'shoes', thumbnail: '/outfit-pieces/slippers.webp' },
  { id: 'barefoot', label: 'Barefoot', emoji: '🦶', category: 'shoes', isAdult: true, thumbnail: '/outfit-pieces/barefoot.webp' },
  
  // ==================== HEADWEAR ====================
  { id: 'none-headwear', label: 'None', emoji: '✕', category: 'headwear', thumbnail: '/outfit-pieces/none-headwear.webp' },
  { id: 'hat', label: 'Hat', emoji: '🧢', category: 'headwear', thumbnail: '/outfit-pieces/hat.webp' },
  { id: 'cap', label: 'Cap', emoji: '🧢', category: 'headwear', thumbnail: '/outfit-pieces/cap.webp' },
  { id: 'beanie', label: 'Beanie', emoji: '🧢', category: 'headwear', thumbnail: '/outfit-pieces/beanie.webp' },
  { id: 'sun-hat', label: 'Sun Hat', emoji: '👒', category: 'headwear', thumbnail: '/outfit-pieces/sun-hat.webp' },
  { id: 'sunglasses', label: 'Sunglasses', emoji: '🕶️', category: 'headwear', thumbnail: '/outfit-pieces/sunglasses.webp' },
  { id: 'glasses', label: 'Glasses', emoji: '👓', category: 'headwear', thumbnail: '/outfit-pieces/glasses.webp' },
  { id: 'headband', label: 'Headband', emoji: '🎀', category: 'headwear', thumbnail: '/outfit-pieces/headband.webp' },
  { id: 'hair-clip', label: 'Hair Clip', emoji: '📎', category: 'headwear', thumbnail: '/outfit-pieces/hair-clip.webp' },
  { id: 'crown', label: 'Crown', emoji: '👑', category: 'headwear', thumbnail: '/outfit-pieces/crown.webp' },
  
  // ==================== OUTERWEAR ====================
  { id: 'none-outerwear', label: 'None', emoji: '✕', category: 'outerwear', thumbnail: '/outfit-pieces/none-outerwear.webp' },
  { id: 'jacket', label: 'Jacket', emoji: '🧥', category: 'outerwear', thumbnail: '/outfit-pieces/jacket.webp' },
  { id: 'denim-jacket', label: 'Denim Jacket', emoji: '🧥', category: 'outerwear', thumbnail: '/outfit-pieces/denim-jacket.webp' },
  { id: 'leather-jacket', label: 'Leather Jacket', emoji: '🖤', category: 'outerwear', thumbnail: '/outfit-pieces/leather-jacket.webp' },
  { id: 'blazer', label: 'Blazer', emoji: '👔', category: 'outerwear', thumbnail: '/outfit-pieces/blazer.webp' },
  { id: 'cardigan', label: 'Cardigan', emoji: '🧥', category: 'outerwear', thumbnail: '/outfit-pieces/cardigan.webp' },
  { id: 'coat', label: 'Coat', emoji: '🧥', category: 'outerwear', thumbnail: '/outfit-pieces/coat.webp' },
  { id: 'hoodie-outerwear', label: 'Hoodie', emoji: '🧥', category: 'outerwear', thumbnail: '/outfit-pieces/hoodie-outerwear.webp' },
  { id: 'windbreaker', label: 'Windbreaker', emoji: '🧥', category: 'outerwear', thumbnail: '/outfit-pieces/windbreaker.webp' },
  { id: 'vest', label: 'Vest', emoji: '👔', category: 'outerwear', thumbnail: '/outfit-pieces/vest.webp' },
  { id: 'open-robe', label: 'Open Robe', emoji: '👘', category: 'outerwear', isAdult: true, thumbnail: '/outfit-pieces/open-robe.webp' },
  
  // ==================== ACCESSORIES ====================
  // Jewelry
  { id: 'necklace', label: 'Necklace', emoji: '💎', category: 'accessory', thumbnail: '/outfit-pieces/necklace.webp' },
  { id: 'earrings', label: 'Earrings', emoji: '💍', category: 'accessory', thumbnail: '/outfit-pieces/earrings.webp' },
  { id: 'bracelet', label: 'Bracelet', emoji: '💍', category: 'accessory', thumbnail: '/outfit-pieces/bracelet.webp' },
  { id: 'ring', label: 'Ring', emoji: '💍', category: 'accessory', thumbnail: '/outfit-pieces/ring.webp' },
  { id: 'anklet', label: 'Anklet', emoji: '💍', category: 'accessory', thumbnail: '/outfit-pieces/anklet.webp' },
  { id: 'choker', label: 'Choker', emoji: '💎', category: 'accessory', thumbnail: '/outfit-pieces/choker.webp' },
  { id: 'pendant', label: 'Pendant', emoji: '💎', category: 'accessory', thumbnail: '/outfit-pieces/pendant.webp' },
  
  // Bags
  { id: 'handbag', label: 'Handbag', emoji: '👜', category: 'accessory', thumbnail: '/outfit-pieces/handbag.webp' },
  { id: 'backpack', label: 'Backpack', emoji: '🎒', category: 'accessory', thumbnail: '/outfit-pieces/backpack.webp' },
  { id: 'clutch', label: 'Clutch', emoji: '👛', category: 'accessory', thumbnail: '/outfit-pieces/clutch.webp' },
  { id: 'crossbody-bag', label: 'Crossbody Bag', emoji: '👜', category: 'accessory', thumbnail: '/outfit-pieces/crossbody-bag.webp' },
  
  // Other Accessories
  { id: 'belt', label: 'Belt', emoji: '👔', category: 'accessory', thumbnail: '/outfit-pieces/belt.webp' },
  { id: 'watch', label: 'Watch', emoji: '⌚', category: 'accessory', thumbnail: '/outfit-pieces/watch.webp' },
  { id: 'scarf', label: 'Scarf', emoji: '🧣', category: 'accessory', thumbnail: '/outfit-pieces/scarf.webp' },
  { id: 'gloves', label: 'Gloves', emoji: '🧤', category: 'accessory', thumbnail: '/outfit-pieces/gloves.webp' },
  { id: 'socks', label: 'Socks', emoji: '🧦', category: 'accessory', thumbnail: '/outfit-pieces/socks.webp' },
  { id: 'stockings', label: 'Stockings', emoji: '🧦', category: 'accessory', thumbnail: '/outfit-pieces/stockings.webp' },
  { id: 'fishnet-stockings', label: 'Fishnet Stockings', emoji: '🧦', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/fishnet-stockings.webp' },
  { id: 'thigh-highs', label: 'Thigh Highs', emoji: '🧦', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/thigh-highs.webp' },
  { id: 'garter-belt', label: 'Garter Belt', emoji: '🎀', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/garter-belt.webp' },
  
  // Adult Content Accessories
  { id: 'collar', label: 'Collar', emoji: '🔗', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/collar.webp' },
  { id: 'leash', label: 'Leash', emoji: '🔗', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/leash.webp' },
  { id: 'harness', label: 'Harness', emoji: '🔗', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/harness.webp' },
  { id: 'body-harness', label: 'Body Harness', emoji: '🔗', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/body-harness.webp' },
  { id: 'bondage-rope', label: 'Bondage Rope', emoji: '🔗', category: 'accessory', isAdult: true, thumbnail: '/outfit-pieces/bondage-rope.webp' },
];

/** All outfit piece categories */
export const OUTFIT_PIECE_CATEGORIES: OutfitPieceCategory[] = [
  'top',
  'bottom',
  'shoes',
  'headwear',
  'outerwear',
  'accessory',
];

/** Get pieces filtered by category */
export const getPiecesByCategory = (
  category: OutfitPieceCategory
): OutfitPiece[] => OUTFIT_PIECES.filter((piece) => piece.category === category);

/** Get piece by ID */
export const getPieceById = (id: string): OutfitPiece | undefined => {
  return OUTFIT_PIECES.find((piece) => piece.id === id);
};

/** Get all pieces (optionally filtered by Adult Content) */
export const getAllPieces = (includeAdult: boolean = false): OutfitPiece[] => {
  if (includeAdult) return OUTFIT_PIECES;
  return OUTFIT_PIECES.filter((piece) => !piece.isAdult);
};

/** Get pieces for a category (optionally filtered by Adult Content) */
export const getCategoryPieces = (
  category: OutfitPieceCategory,
  includeAdult: boolean = false
): OutfitPiece[] => {
  const pieces = getPiecesByCategory(category);
  if (includeAdult) return pieces;
  return pieces.filter((piece) => !piece.isAdult);
};

/**
 * Build outfit prompt string from OutfitComposition
 * Converts a multi-piece outfit composition into a prompt string
 */
export function buildOutfitPrompt(composition: OutfitComposition | null | undefined): string {
  if (!composition) return '';
  
  const parts: string[] = [];
  
  // Required pieces (top, bottom, shoes)
  if (composition.top) {
    const piece = getPieceById(composition.top);
    if (piece) parts.push(piece.label.toLowerCase());
  }
  if (composition.bottom) {
    const piece = getPieceById(composition.bottom);
    if (piece) parts.push(piece.label.toLowerCase());
  }
  if (composition.shoes) {
    const piece = getPieceById(composition.shoes);
    if (piece) parts.push(piece.label.toLowerCase());
  }
  
  // Optional pieces (only if not "none")
  if (composition.headwear && composition.headwear !== 'none' && composition.headwear !== 'none-headwear') {
    const piece = getPieceById(composition.headwear);
    if (piece) parts.push(`wearing ${piece.label.toLowerCase()}`);
  }
  if (composition.outerwear && composition.outerwear !== 'none' && composition.outerwear !== 'none-outerwear') {
    const piece = getPieceById(composition.outerwear);
    if (piece) parts.push(`wearing ${piece.label.toLowerCase()}`);
  }
  
  // Accessories (multiple)
  if (composition.accessories && composition.accessories.length > 0) {
    const accessoryLabels = composition.accessories
      .map((id: string) => {
        const piece = getPieceById(id);
        return piece ? piece.label.toLowerCase() : id;
      })
      .join(', ');
    if (accessoryLabels) parts.push(`with ${accessoryLabels}`);
  }
  
  return parts.length > 0 ? `wearing ${parts.join(', ')}` : '';
}

