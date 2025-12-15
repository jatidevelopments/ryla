import type { SelectOption } from '../character/types';

/**
 * Scene presets for Content Studio
 * 8 predefined scenarios for image generation
 */
export const SCENE_OPTIONS: SelectOption[] = [
  {
    value: 'professional-portrait',
    label: 'Professional Portrait',
    description: 'Clean studio headshot, professional lighting',
    emoji: '📸',
  },
  {
    value: 'candid-lifestyle',
    label: 'Candid Lifestyle',
    description: 'Natural, everyday moment capture',
    emoji: '🌟',
  },
  {
    value: 'fashion-editorial',
    label: 'Fashion Editorial',
    description: 'High-fashion magazine style',
    emoji: '👗',
  },
  {
    value: 'fitness-motivation',
    label: 'Fitness Motivation',
    description: 'Athletic, workout energy',
    emoji: '💪',
  },
  {
    value: 'morning-vibes',
    label: 'Morning Vibes',
    description: 'Soft light, cozy morning feel',
    emoji: '☀️',
  },
  {
    value: 'night-out',
    label: 'Night Out',
    description: 'Evening glamour, nightlife aesthetic',
    emoji: '🌙',
  },
  {
    value: 'cozy-at-home',
    label: 'Cozy at Home',
    description: 'Relaxed, intimate home setting',
    emoji: '🏠',
  },
  {
    value: 'beach-day',
    label: 'Beach Day',
    description: 'Sun, sand, and tropical vibes',
    emoji: '🏖️',
  },
];

export const DEFAULT_SCENE = 'candid-lifestyle';

