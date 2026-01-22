/**
 * Image generation options for character wizard (Step 6: Generate)
 * Defines aspect ratios and quality modes
 */

import type { PlatformId } from '../platforms';

export interface AspectRatioOption {
  label: string;
  value: string;
  width: number;
  height: number;
  useCase: string; // Legacy field, kept for backward compatibility
  platforms: PlatformId[]; // Supported platforms for this aspect ratio
  primaryPlatform?: PlatformId; // Main platform for this format
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    label: '1:1',
    value: '1:1',
    width: 1024,
    height: 1024,
    useCase: 'Instagram feed, profile pics',
    platforms: ['instagram', 'pinterest', 'onlyfans', 'fanvue', 'twitter', 'facebook'],
    primaryPlatform: 'instagram',
  },
  {
    label: '9:16',
    value: '9:16',
    width: 768,
    height: 1365,
    useCase: 'Stories, TikTok, Reels',
    platforms: ['tiktok', 'instagram', 'youtube', 'onlyfans', 'fanvue'],
    primaryPlatform: 'tiktok',
  },
  {
    label: '2:3',
    value: '2:3',
    width: 819,
    height: 1228,
    useCase: 'Pinterest, OnlyFans',
    platforms: ['pinterest', 'onlyfans', 'fanvue'],
    primaryPlatform: 'pinterest',
  },
];

/** Default generation settings */
export const DEFAULT_GENERATION_SETTINGS = {
  aspectRatio: '9:16' as const,
  nsfwEnabled: false,
};

