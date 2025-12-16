/**
 * Character option types for RYLA MVP
 * Copied and adapted from MDC: mdc-next-frontend/constants/
 */

export enum CharacterGender {
  Female = 'female',
  Male = 'male',
}

export enum CharacterStyle {
  Realistic = 'realistic',
  Anime = 'anime',
}

export interface CharacterOption {
  id: number;
  title: string;
  value: string;
  imageSrc?: string;
  gender?: CharacterGender | 'all';
}

export interface ColorOption {
  color: string;
  value: string;
  imageSrc?: string;
}

export interface OutfitOption {
  label: string;
  emoji: string;
  category?: 'casual' | 'glamour' | 'intimate' | 'fantasy';
}

export interface PersonalityOption {
  label: string;
  emoji: string;
  category?: 'energy' | 'social' | 'lifestyle' | 'vibe';
}

export interface ArchetypeOption {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
}

