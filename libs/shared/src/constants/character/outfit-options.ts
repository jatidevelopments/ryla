/**
 * Outfit options for character wizard (Step 5: Details)
 * Source: MDC mdc-next-frontend/constants/clothes-options.ts
 * MVP: Top 20 outfits organized by category
 * Note: US users prefer "date night glam" (31% vs 22% global)
 */

import { OutfitOption } from './types';

export const OUTFIT_OPTIONS: OutfitOption[] = [
  // Casual (6)
  { label: 'Casual Streetwear', emoji: '👕', category: 'casual' },
  { label: 'Athleisure', emoji: '🏃', category: 'casual' },
  { label: 'Yoga', emoji: '🧘', category: 'casual' },
  { label: 'Jeans', emoji: '👖', category: 'casual' },
  { label: 'Tank Top', emoji: '👚', category: 'casual' },
  { label: 'Crop Top', emoji: '👕', category: 'casual' },

  // Glamour (5)
  { label: 'Date Night Glam', emoji: '✨', category: 'glamour' },
  { label: 'Cocktail Dress', emoji: '👗', category: 'glamour' },
  { label: 'Mini Skirt', emoji: '🩳', category: 'glamour' },
  { label: 'Dress', emoji: '👗', category: 'glamour' },
  { label: 'Summer Chic', emoji: '🌸', category: 'glamour' },

  // Intimate (5)
  { label: 'Bikini', emoji: '👙', category: 'intimate' },
  { label: 'Lingerie', emoji: '💋', category: 'intimate' },
  { label: 'Swimsuit', emoji: '🩱', category: 'intimate' },
  { label: 'Nightgown', emoji: '🌙', category: 'intimate' },
  { label: 'Leotard', emoji: '🤸', category: 'intimate' },

  // Fantasy (4)
  { label: 'Cheerleader', emoji: '📣', category: 'fantasy' },
  { label: 'Nurse', emoji: '👩‍⚕️', category: 'fantasy' },
  { label: 'Maid', emoji: '🧹', category: 'fantasy' },
  { label: 'Student Uniform', emoji: '🎓', category: 'fantasy' },
];

/** Get outfits filtered by category */
export const getOutfitsByCategory = (
  category: OutfitOption['category']
): OutfitOption[] => OUTFIT_OPTIONS.filter((opt) => opt.category === category);

/** All outfit categories */
export const OUTFIT_CATEGORIES = ['casual', 'glamour', 'intimate', 'fantasy'] as const;

