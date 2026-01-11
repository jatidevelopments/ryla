import { FEATURE_CREDITS } from '@ryla/shared';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  isRead: boolean;
  createdAt?: string | Date | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Estimate credit cost from quality mode for display
 */
export function estimateCreditCost(
  qualityMode: string | null | undefined,
  imageCount: number | null | undefined
): number | null {
  if (!qualityMode) return null;

  const count = imageCount ?? 1;

  switch (qualityMode.toLowerCase()) {
    case 'fast':
    case 'draft':
    case 'studio_fast':
      return FEATURE_CREDITS.studio_fast.credits * count;
    case 'standard':
    case 'hq':
    case 'studio_standard':
      return FEATURE_CREDITS.studio_standard.credits * count;
    case 'profile_set_fast':
      return FEATURE_CREDITS.profile_set_fast.credits;
    case 'profile_set_quality':
      return FEATURE_CREDITS.profile_set_quality.credits;
    case 'base_images':
      return FEATURE_CREDITS.base_images.credits;
    default:
      return null;
  }
}

/**
 * Format a date as relative time (e.g., "2 minutes ago", "3 hours ago")
 */
export function formatRelativeTime(input: Date): string {
  const diffMs = input.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(diffSeconds, 'second');
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

