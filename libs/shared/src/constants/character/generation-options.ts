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

export interface QualityModeOption {
  label: string;
  value: string;
  steps: number;
  credits: number;
  description: string;
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

export const QUALITY_MODE_OPTIONS: QualityModeOption[] = [
  {
    label: 'Draft',
    value: 'draft',
    steps: 20,
    credits: 1,
    description: 'Fast preview (~10s)',
  },
  {
    label: 'High Quality',
    value: 'hq',
    steps: 40,
    credits: 3,
    description: 'Best quality (~30s)',
  },
];

/** Default generation settings */
export const DEFAULT_GENERATION_SETTINGS = {
  aspectRatio: '9:16' as const,
  qualityMode: 'draft' as const,
  nsfwEnabled: false,
};

