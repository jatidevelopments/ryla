/**
 * Platform definitions for social media export
 * Maps aspect ratios to supported platforms with export capabilities
 */

export type PlatformId = 
  | 'instagram' 
  | 'tiktok' 
  | 'pinterest' 
  | 'onlyfans' 
  | 'fanvue' 
  | 'twitter' 
  | 'youtube' 
  | 'facebook';

export type AspectRatio = '1:1' | '4:5' | '9:16' | '2:3' | '16:9' | '3:4' | '4:3' | '3:2';

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string; // Path to SVG icon
  color: string; // Tailwind gradient classes
  supportedFormats: AspectRatio[];
  exportEnabled: boolean;
  exportUrl?: string; // Deep link or API endpoint (future)
  description?: string;
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '/logos/platforms/instagram.svg',
    color: 'from-purple-500 via-pink-500 to-orange-400',
    supportedFormats: ['1:1', '4:5', '9:16', '3:4'],
    exportEnabled: true,
    description: 'Feed posts, Stories, Reels',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '/logos/platforms/tiktok.svg',
    color: 'from-black to-gray-800',
    supportedFormats: ['9:16'],
    exportEnabled: true,
    description: 'Videos, Shorts',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '/logos/platforms/pinterest.svg',
    color: 'from-red-500 to-red-700',
    supportedFormats: ['2:3', '1:1', '3:4'],
    exportEnabled: true,
    description: 'Pins',
  },
  onlyfans: {
    id: 'onlyfans',
    name: 'OnlyFans',
    icon: '/logos/platforms/onlyfans.svg',
    color: 'from-pink-500 to-red-500',
    supportedFormats: ['2:3', '1:1', '9:16'],
    exportEnabled: true,
    description: 'Posts, Messages',
  },
  fanvue: {
    id: 'fanvue',
    name: 'Fanvue',
    icon: '/logos/platforms/fanvue.svg',
    color: 'from-orange-500 to-red-500',
    supportedFormats: ['2:3', '1:1', '9:16'],
    exportEnabled: true,
    description: 'Posts, Messages',
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '/logos/platforms/twitter.svg',
    color: 'from-blue-400 to-blue-600',
    supportedFormats: ['16:9', '1:1', '4:3', '3:2'],
    exportEnabled: true,
    description: 'Tweets, Threads',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '/logos/platforms/youtube.svg',
    color: 'from-red-500 to-red-700',
    supportedFormats: ['16:9', '9:16'],
    exportEnabled: true,
    description: 'Shorts, Videos',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '/logos/platforms/facebook.svg',
    color: 'from-blue-500 to-blue-700',
    supportedFormats: ['1:1', '16:9', '4:3', '3:2'],
    exportEnabled: true,
    description: 'Posts, Stories',
  },
};

/**
 * Get all platforms that support a given aspect ratio
 */
export function getPlatformsForAspectRatio(aspectRatio: AspectRatio): Platform[] {
  return Object.values(PLATFORMS).filter(platform => 
    platform.supportedFormats.includes(aspectRatio)
  );
}

/**
 * Get the primary platform for an aspect ratio (most common use case)
 */
export function getPrimaryPlatformForAspectRatio(aspectRatio: AspectRatio): Platform | null {
  const platformMap: Partial<Record<AspectRatio, PlatformId>> = {
    '1:1': 'instagram',
    '4:5': 'instagram',
    '9:16': 'tiktok',
    '2:3': 'pinterest',
    '16:9': 'youtube',
    '3:4': 'instagram',
    '4:3': 'facebook',
    '3:2': 'facebook',
  };

  const platformId = platformMap[aspectRatio];
  return platformId ? PLATFORMS[platformId] : null;
}

/**
 * Check if an aspect ratio is supported by a platform
 */
export function isAspectRatioSupportedByPlatform(
  aspectRatio: AspectRatio,
  platformId: PlatformId
): boolean {
  const platform = PLATFORMS[platformId];
  return platform?.supportedFormats.includes(aspectRatio) ?? false;
}

