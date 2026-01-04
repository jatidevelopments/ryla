/**
 * Outfit options for character wizard (Step 5: Details)
 * Source: MDC mdc-next-frontend/constants/clothes-options.ts
 * Expanded with more outfits including NSFW categories
 * Note: US users prefer "date night glam" (31% vs 22% global)
 */

import { OutfitOption } from './types';

export const OUTFIT_OPTIONS: OutfitOption[] = [
  // Casual (10)
  { label: 'Casual Streetwear', emoji: '👕', category: 'casual', thumbnail: '/outfits/casual-streetwear.webp' },
  { label: 'Athleisure', emoji: '🏃', category: 'casual', thumbnail: '/outfits/athleisure.webp' },
  { label: 'Yoga', emoji: '🧘', category: 'casual', thumbnail: '/outfits/yoga.webp' },
  { label: 'Jeans', emoji: '👖', category: 'casual', thumbnail: '/outfits/jeans.webp' },
  { label: 'Tank Top', emoji: '👚', category: 'casual', thumbnail: '/outfits/tank-top.webp' },
  { label: 'Crop Top', emoji: '👕', category: 'casual', thumbnail: '/outfits/crop-top.webp' },
  { label: 'Hoodie', emoji: '🧥', category: 'casual', thumbnail: '/outfits/hoodie.webp' },
  { label: 'Sweatpants', emoji: '👖', category: 'casual', thumbnail: '/outfits/sweatpants.webp' },
  { label: 'Denim Jacket', emoji: '🧥', category: 'casual', thumbnail: '/outfits/denim-jacket.webp' },
  { label: 'Sneakers & Leggings', emoji: '👟', category: 'casual', thumbnail: '/outfits/sneakers-&-leggings.webp' },

  // Glamour (10)
  { label: 'Date Night Glam', emoji: '✨', category: 'glamour', thumbnail: '/outfits/date-night-glam.webp' },
  { label: 'Cocktail Dress', emoji: '👗', category: 'glamour', thumbnail: '/outfits/cocktail-dress.webp' },
  { label: 'Mini Skirt', emoji: '🩳', category: 'glamour', thumbnail: '/outfits/mini-skirt.webp' },
  { label: 'Dress', emoji: '👗', category: 'glamour', thumbnail: '/outfits/dress.webp' },
  { label: 'Summer Chic', emoji: '🌸', category: 'glamour', thumbnail: '/outfits/summer-chic.webp' },
  { label: 'Evening Gown', emoji: '✨', category: 'glamour', thumbnail: '/outfits/evening-gown.webp' },
  { label: 'Bodycon Dress', emoji: '👗', category: 'glamour', thumbnail: '/outfits/bodycon-dress.webp' },
  { label: 'High Heels & Dress', emoji: '👠', category: 'glamour', thumbnail: '/outfits/high-heels-&-dress.webp' },
  { label: 'Formal Attire', emoji: '👔', category: 'glamour', thumbnail: '/outfits/formal-attire.webp' },
  { label: 'Red Carpet', emoji: '🌟', category: 'glamour', thumbnail: '/outfits/red-carpet.webp' },

  // Intimate (10)
  { label: 'Bikini', emoji: '👙', category: 'intimate', thumbnail: '/outfits/bikini.webp' },
  { label: 'Lingerie', emoji: '💋', category: 'intimate', thumbnail: '/outfits/lingerie.webp' },
  { label: 'Swimsuit', emoji: '🩱', category: 'intimate', thumbnail: '/outfits/swimsuit.webp' },
  { label: 'Nightgown', emoji: '🌙', category: 'intimate', thumbnail: '/outfits/nightgown.webp' },
  { label: 'Leotard', emoji: '🤸', category: 'intimate', thumbnail: '/outfits/leotard.webp' },
  { label: 'Teddy', emoji: '💋', category: 'intimate', thumbnail: '/outfits/teddy.webp' },
  { label: 'Babydoll', emoji: '🌙', category: 'intimate', thumbnail: '/outfits/babydoll.webp' },
  { label: 'Bodysuit', emoji: '👙', category: 'intimate', thumbnail: '/outfits/bodysuit.webp' },
  { label: 'Chemise', emoji: '💋', category: 'intimate', thumbnail: '/outfits/chemise.webp' },
  { label: 'Slip', emoji: '🌙', category: 'intimate', thumbnail: '/outfits/slip.webp' },

  // Fantasy (10)
  { label: 'Cheerleader', emoji: '📣', category: 'fantasy', thumbnail: '/outfits/cheerleader.webp' },
  { label: 'Nurse', emoji: '👩‍⚕️', category: 'fantasy', thumbnail: '/outfits/nurse.webp' },
  { label: 'Maid', emoji: '🧹', category: 'fantasy', thumbnail: '/outfits/maid.webp' },
  { label: 'Student Uniform', emoji: '🎓', category: 'fantasy', thumbnail: '/outfits/student-uniform.webp' },
  { label: 'Police Officer', emoji: '👮', category: 'fantasy', thumbnail: '/outfits/police-officer.webp' },
  { label: 'Bunny', emoji: '🐰', category: 'fantasy', thumbnail: '/outfits/bunny.webp' },
  { label: 'Cat', emoji: '🐱', category: 'fantasy', thumbnail: '/outfits/cat.webp' },
  { label: 'Princess', emoji: '👸', category: 'fantasy', thumbnail: '/outfits/princess.webp' },
  { label: 'Superhero', emoji: '🦸', category: 'fantasy', thumbnail: '/outfits/superhero.webp' },
  { label: 'Witch', emoji: '🧙', category: 'fantasy', thumbnail: '/outfits/witch.webp' },

  // Kinky (NSFW) (15)
  { label: 'Bondage Gear', emoji: '🔗', category: 'kinky', isAdult: true, thumbnail: '/outfits/bondage-gear.webp' },
  { label: 'Leather Outfit', emoji: '🖤', category: 'kinky', isAdult: true, thumbnail: '/outfits/leather-outfit.webp' },
  { label: 'Latex', emoji: '✨', category: 'kinky', isAdult: true, thumbnail: '/outfits/latex.webp' },
  { label: 'Corset', emoji: '🎀', category: 'kinky', isAdult: true, thumbnail: '/outfits/corset.webp' },
  { label: 'Fishnet Stockings', emoji: '🧦', category: 'kinky', isAdult: true, thumbnail: '/outfits/fishnet-stockings.webp' },
  { label: 'Garter Belt', emoji: '🎀', category: 'kinky', isAdult: true, thumbnail: '/outfits/garter-belt.webp' },
  { label: 'Thigh Highs', emoji: '🧦', category: 'kinky', isAdult: true, thumbnail: '/outfits/thigh-highs.webp' },
  { label: 'Collar & Leash', emoji: '🔗', category: 'kinky', isAdult: true, thumbnail: '/outfits/collar-&-leash.webp' },
  { label: 'PVC Outfit', emoji: '✨', category: 'kinky', isAdult: true, thumbnail: '/outfits/pvc-outfit.webp' },
  { label: 'Harness', emoji: '🔗', category: 'kinky', isAdult: true, thumbnail: '/outfits/harness.webp' },
  { label: 'Cage Bra', emoji: '🖤', category: 'kinky', isAdult: true, thumbnail: '/outfits/cage-bra.webp' },
  { label: 'Pasties Only', emoji: '✨', category: 'kinky', isAdult: true, thumbnail: '/outfits/pasties-only.webp' },
  { label: 'Body Harness', emoji: '🔗', category: 'kinky', isAdult: true, thumbnail: '/outfits/body-harness.webp' },
  { label: 'Strap-On', emoji: '🔗', category: 'kinky', isAdult: true, thumbnail: '/outfits/strap-on.webp' },
  { label: 'Bondage Rope', emoji: '🔗', category: 'kinky', isAdult: true, thumbnail: '/outfits/bondage-rope.webp' },

  // Sexual (NSFW) (15)
  { label: 'Nude', emoji: '🔥', category: 'sexual', isAdult: true, thumbnail: '/outfits/nude.webp' },
  { label: 'Topless', emoji: '🔥', category: 'sexual', isAdult: true, thumbnail: '/outfits/topless.webp' },
  { label: 'Bottomless', emoji: '🔥', category: 'sexual', isAdult: true, thumbnail: '/outfits/bottomless.webp' },
  { label: 'See-Through', emoji: '🔥', category: 'sexual', isAdult: true, thumbnail: '/outfits/see-through.webp' },
  { label: 'Wet T-Shirt', emoji: '💦', category: 'sexual', isAdult: true, thumbnail: '/outfits/wet-t-shirt.webp' },
  { label: 'Oil Covered', emoji: '💦', category: 'sexual', isAdult: true, thumbnail: '/outfits/oil-covered.webp' },
  { label: 'Shower Scene', emoji: '🚿', category: 'sexual', isAdult: true, thumbnail: '/outfits/shower-scene.webp' },
  { label: 'Bed Sheets Only', emoji: '🛏️', category: 'sexual', isAdult: true, thumbnail: '/outfits/bed-sheets-only.webp' },
  { label: 'Towel Wrap', emoji: '🛁', category: 'sexual', isAdult: true, thumbnail: '/outfits/towel-wrap.webp' },
  { label: 'Open Robe', emoji: '👘', category: 'sexual', isAdult: true, thumbnail: '/outfits/open-robe.webp' },
  { label: 'Peek-a-Boo', emoji: '👀', category: 'sexual', isAdult: true, thumbnail: '/outfits/peek-a-boo.webp' },
  { label: 'Micro Bikini', emoji: '🔥', category: 'sexual', isAdult: true, thumbnail: '/outfits/micro-bikini.webp' },
  { label: 'Pasties & Thong', emoji: '🔥', category: 'sexual', isAdult: true, thumbnail: '/outfits/pasties-&-thong.webp' },
  { label: 'Body Paint', emoji: '🎨', category: 'sexual', isAdult: true, thumbnail: '/outfits/body-paint.webp' },
  { label: 'Edible Outfit', emoji: '🍓', category: 'sexual', isAdult: true, thumbnail: '/outfits/edible-outfit.webp' },
];

/** Get outfits filtered by category */
export const getOutfitsByCategory = (
  category: OutfitOption['category']
): OutfitOption[] => OUTFIT_OPTIONS.filter((opt) => opt.category === category);

/** All outfit categories */
export const OUTFIT_CATEGORIES = ['casual', 'glamour', 'intimate', 'fantasy', 'kinky', 'sexual'] as const;

