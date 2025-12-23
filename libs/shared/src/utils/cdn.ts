/**
 * CDN Utilities
 * 
 * Helper functions for working with CDN-hosted assets.
 * Configure via NEXT_PUBLIC_CDN_URL environment variable.
 */

const CDN_URL = typeof process !== 'undefined' 
  ? process.env['NEXT_PUBLIC_CDN_URL']?.replace(/\/$/, "")
  : undefined;

const DEBUG_CDN = typeof process !== 'undefined' && (
  process.env['NEXT_PUBLIC_DEBUG_CDN'] === "true" || 
  (typeof window !== "undefined" && (window as any).__DEBUG_CDN__)
);

const isAbsoluteUrl = (value: string) => 
  /^https?:\/\//i.test(value) || value.startsWith("data:");

/**
 * Prefixes a relative asset path with the configured CDN URL.
 * Falls back to the original path when:
 * - No CDN_URL is configured
 * - The path is already an absolute URL
 * - The path is a data URI
 * 
 * @param path - The asset path to prefix
 * @returns The CDN-prefixed URL or original path
 * 
 * @example
 * ```ts
 * // With NEXT_PUBLIC_CDN_URL=https://cdn.example.com
 * withCdn('/images/hero.jpg') // => 'https://cdn.example.com/images/hero.jpg'
 * withCdn('images/hero.jpg')  // => 'https://cdn.example.com/images/hero.jpg'
 * withCdn('https://other.com/img.jpg') // => 'https://other.com/img.jpg' (unchanged)
 * ```
 */
export function withCdn(path: string | undefined | null): string {
  if (!path) return "";

  if (isAbsoluteUrl(path)) {
    if (DEBUG_CDN) {
      console.log(`[CDN] Already absolute URL, skipping: ${path}`);
    }
    return path;
  }

  if (!CDN_URL) {
    if (DEBUG_CDN) {
      console.log(`[CDN] No CDN URL configured, using original path: ${path}`);
    }
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const cdnUrl = `${CDN_URL}${normalizedPath}`;

  if (DEBUG_CDN) {
    console.log(`[CDN] ✅ Using CDN: ${path} → ${cdnUrl}`);
  }

  return cdnUrl;
}

/**
 * Get current CDN configuration status.
 * Useful for debugging CDN setup.
 * 
 * @returns CDN configuration object
 */
export function getCdnStatus() {
  return {
    enabled: !!CDN_URL,
    url: CDN_URL || "Not configured",
    debug: DEBUG_CDN,
  };
}

/**
 * Check if CDN is configured and enabled.
 */
export function isCdnEnabled(): boolean {
  return !!CDN_URL;
}

