import type { SelectOption } from '../character/types';

/**
 * Environment presets for Content Studio
 * 7 predefined locations for image generation
 */
export const ENVIRONMENT_OPTIONS: SelectOption[] = [
  {
    value: 'beach',
    label: 'Beach',
    description: 'Sandy shores, ocean backdrop',
    emoji: '🏝️',
  },
  {
    value: 'home-bedroom',
    label: 'Bedroom',
    description: 'Cozy bedroom interior',
    emoji: '🛏️',
  },
  {
    value: 'home-living-room',
    label: 'Living Room',
    description: 'Modern living space',
    emoji: '🛋️',
  },
  {
    value: 'office',
    label: 'Office',
    description: 'Professional workspace',
    emoji: '💼',
  },
  {
    value: 'cafe',
    label: 'Cafe',
    description: 'Coffee shop ambiance',
    emoji: '☕',
  },
  {
    value: 'urban-street',
    label: 'Urban Street',
    description: 'City streets and buildings',
    emoji: '🏙️',
  },
  {
    value: 'studio',
    label: 'Photo Studio',
    description: 'Professional photo backdrop',
    emoji: '📷',
  },
];

export const DEFAULT_ENVIRONMENT = 'studio';

