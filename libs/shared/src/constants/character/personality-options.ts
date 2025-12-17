/**
 * Personality trait options for character wizard (Step 5: Identity)
 * Source: MDC mdc-next-frontend/constants/personality-options.ts
 * MVP: 16 traits organized by category (user picks 3)
 */

import { PersonalityOption } from './types';

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  // Energy (4)
  { label: 'Confident', emoji: '😎', category: 'energy' },
  { label: 'Shy', emoji: '😳', category: 'energy' },
  { label: 'Bold', emoji: '⚡', category: 'energy' },
  { label: 'Laid-back', emoji: '😌', category: 'energy' },

  // Social (4)
  { label: 'Playful', emoji: '😛', category: 'social' },
  { label: 'Mysterious', emoji: '🔮', category: 'social' },
  { label: 'Caring', emoji: '🤗', category: 'social' },
  { label: 'Independent', emoji: '🦁', category: 'social' },

  // Lifestyle (4)
  { label: 'Adventurous', emoji: '🏕️', category: 'lifestyle' },
  { label: 'Homebody', emoji: '🏠', category: 'lifestyle' },
  { label: 'Ambitious', emoji: '🚀', category: 'lifestyle' },
  { label: 'Creative', emoji: '🎨', category: 'lifestyle' },

  // Vibe (4)
  { label: 'Flirty', emoji: '😉', category: 'vibe' },
  { label: 'Classy', emoji: '🍸', category: 'vibe' },
  { label: 'Edgy', emoji: '🖤', category: 'vibe' },
  { label: 'Sweet', emoji: '🍭', category: 'vibe' },
];

/** Get personality traits filtered by category */
export const getPersonalityByCategory = (
  category: PersonalityOption['category']
): PersonalityOption[] =>
  PERSONALITY_OPTIONS.filter((opt) => opt.category === category);

/** All personality categories */
export const PERSONALITY_CATEGORIES = ['energy', 'social', 'lifestyle', 'vibe'] as const;

/** Maximum traits user can select */
export const MAX_PERSONALITY_TRAITS = 3;

/**
 * Personality trait option with value field for form compatibility
 */
export interface PersonalityTraitOption extends PersonalityOption {
  value: string;
}

/**
 * Personality trait options with value field for form compatibility
 * Maps PERSONALITY_OPTIONS to include a value field (lowercase label, spaces to underscores)
 * Example: "Laid-back" -> "laid_back"
 */
export const PERSONALITY_TRAIT_OPTIONS: PersonalityTraitOption[] = PERSONALITY_OPTIONS.map((option) => ({
  ...option,
  value: option.label.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_'),
}));

