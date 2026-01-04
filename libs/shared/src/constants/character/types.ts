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
  category?: 'casual' | 'glamour' | 'intimate' | 'fantasy' | 'kinky' | 'sexual';
  isAdult?: boolean; // NSFW outfits
  thumbnail?: string; // Path to thumbnail image (e.g., '/outfits/casual-streetwear.webp')
}

export type OutfitPieceCategory = 
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'headwear'
  | 'outerwear'
  | 'accessory';

export interface OutfitPiece {
  id: string;                    // e.g., "tank-top", "jeans", "sneakers"
  label: string;                 // e.g., "Tank Top", "Jeans", "Sneakers"
  emoji: string;                  // e.g., "👕", "👖", "👟"
  category: OutfitPieceCategory;
  isAdult?: boolean;              // Adult Content flag
  compatibleWith?: string[];     // Phase 2+: IDs of compatible pieces
  thumbnail?: string;             // Path to thumbnail image (e.g., '/outfits/tank-top.webp')
}

export interface OutfitComposition {
  top?: string;                  // Single selection: piece ID
  bottom?: string;               // Single selection: piece ID
  shoes?: string;                // Single selection: piece ID
  headwear?: string;             // Single selection: piece ID (optional, "none" to explicitly clear)
  outerwear?: string;            // Single selection: piece ID (optional, "none" to explicitly clear)
  accessories?: string[];        // Multiple selection: array of piece IDs
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

