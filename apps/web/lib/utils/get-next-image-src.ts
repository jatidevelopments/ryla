/**
 * Normalize image src for next/image so relative paths (e.g. from API) are valid.
 * next/image requires: absolute URL (http/https) or path starting with "/".
 */

import { withCdn } from '@ryla/shared';

const isAbsoluteUrl = (s: string) =>
  /^https?:\/\//i.test(s) || s.startsWith('data:');

/**
 * Returns a src string safe for next/image.
 * - Absolute URLs (http/https/data:) are returned as-is.
 * - Relative paths (e.g. "users/anonymous/base-images/...") are passed through
 *   withCdn so they get a leading slash and optional CDN base URL.
 */
export function getNextImageSrc(src: string | undefined | null): string {
  if (src == null || src === '') return '';
  if (isAbsoluteUrl(src)) return src;
  return withCdn(src);
}
