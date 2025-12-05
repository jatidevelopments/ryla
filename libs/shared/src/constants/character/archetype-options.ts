/**
 * Archetype options for character wizard (Step 5: Identity)
 * NEW for RYLA MVP - defines character persona type
 */

import { ArchetypeOption } from './types';

export const ARCHETYPE_OPTIONS: ArchetypeOption[] = [
  {
    id: 'girl-next-door',
    label: 'Girl Next Door',
    description: 'Approachable, relatable, everyday charm',
    emoji: '🏡',
  },
  {
    id: 'fitness-enthusiast',
    label: 'Fitness Enthusiast',
    description: 'Athletic, health-focused, energetic',
    emoji: '💪',
  },
  {
    id: 'luxury-lifestyle',
    label: 'Luxury Lifestyle',
    description: 'Glamorous, sophisticated, high-end',
    emoji: '💎',
  },
  {
    id: 'mysterious-edgy',
    label: 'Mysterious & Edgy',
    description: 'Dark aesthetic, intriguing, alternative',
    emoji: '🖤',
  },
  {
    id: 'playful-fun',
    label: 'Playful & Fun',
    description: 'Bubbly, energetic, entertaining',
    emoji: '🎉',
  },
  {
    id: 'professional-boss',
    label: 'Professional Boss',
    description: 'Confident, business-minded, powerful',
    emoji: '👔',
  },
];

