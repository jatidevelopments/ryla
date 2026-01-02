/**
 * Platform Export Utilities
 * 
 * Functions for exporting images to social media platforms
 * with platform-specific optimizations
 */

import type { PlatformId, AspectRatio } from '../constants/platforms';
import { PLATFORMS, isAspectRatioSupportedByPlatform } from '../constants/platforms';

export interface ExportOptions {
  imageUrl: string;
  caption?: string;
  platformId: PlatformId;
  aspectRatio: AspectRatio;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  platform: PlatformId;
  downloadedFile?: string;
  error?: string;
}

/**
 * Validate that an aspect ratio is supported by a platform
 */
export function validatePlatformExport(
  aspectRatio: AspectRatio,
  platformId: PlatformId
): { valid: boolean; error?: string } {
  if (!isAspectRatioSupportedByPlatform(aspectRatio, platformId)) {
    const platform = PLATFORMS[platformId];
    return {
      valid: false,
      error: `${platform.name} does not support ${aspectRatio} aspect ratio. Supported formats: ${platform.supportedFormats.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Get platform-optimized filename
 */
export function getPlatformFilename(
  platformId: PlatformId,
  aspectRatio: AspectRatio,
  customName?: string
): string {
  const platform = PLATFORMS[platformId];
  const timestamp = Date.now();
  const name = customName || 'ryla-export';
  return `${name}-${platform.id}-${aspectRatio.replace(':', 'x')}-${timestamp}.png`;
}

/**
 * Download image with platform-specific filename
 */
export async function downloadImageForPlatform(
  imageUrl: string,
  options: ExportOptions
): Promise<ExportResult> {
  const validation = validatePlatformExport(options.aspectRatio, options.platformId);
  if (!validation.valid) {
    return {
      success: false,
      platform: options.platformId,
      error: validation.error,
    };
  }

  try {
    // Fetch image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = options.filename || getPlatformFilename(
      options.platformId,
      options.aspectRatio
    );
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Copy caption to clipboard if provided
    if (options.caption) {
      try {
        await navigator.clipboard.writeText(options.caption);
      } catch (clipboardError) {
        console.warn('Failed to copy caption to clipboard:', clipboardError);
      }
    }

    return {
      success: true,
      platform: options.platformId,
      downloadedFile: a.download,
    };
  } catch (error) {
    return {
      success: false,
      platform: options.platformId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Export to multiple platforms at once
 */
export async function exportToMultiplePlatforms(
  imageUrl: string,
  aspectRatio: AspectRatio,
  platformIds: PlatformId[],
  caption?: string
): Promise<ExportResult[]> {
  const results = await Promise.all(
    platformIds.map(async (platformId) => {
      return downloadImageForPlatform(imageUrl, {
        imageUrl,
        caption,
        platformId,
        aspectRatio,
      });
    })
  );

  return results;
}

/**
 * Get export suggestions based on aspect ratio
 * Returns platforms sorted by relevance (primary platform first)
 */
export function getExportSuggestions(aspectRatio: AspectRatio): PlatformId[] {
  const platforms = Object.values(PLATFORMS)
    .filter(p => p.supportedFormats.includes(aspectRatio))
    .sort((a, b) => {
      // Prioritize platforms that are more commonly used for this aspect ratio
      const priority: Partial<Record<AspectRatio, PlatformId[]>> = {
        '1:1': ['instagram', 'pinterest', 'twitter'],
        '9:16': ['tiktok', 'instagram', 'youtube'],
        '2:3': ['pinterest', 'onlyfans', 'fanvue'],
        '16:9': ['youtube', 'twitter', 'facebook'],
      };

      const priorities = priority[aspectRatio] || [];
      const aIndex = priorities.indexOf(a.id);
      const bIndex = priorities.indexOf(b.id);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  return platforms.map(p => p.id);
}

