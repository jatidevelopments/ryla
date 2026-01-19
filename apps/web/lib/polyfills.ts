/**
 * Browser Polyfills
 *
 * This file provides polyfills for browser APIs that may not be available
 * in older browsers, especially Safari versions < 15.
 *
 * Next.js 14 uses SWC which automatically transpiles modern JS syntax based on
 * browserslist configuration. However, runtime APIs still need polyfills.
 *
 * For production, consider using a polyfill service like Polyfill.io for
 * conditional loading based on user-agent detection.
 *
 * @see https://nextjs.org/docs/advanced-features/customizing-babel-config
 * @see https://polyfill.io/v3/
 */

// Only import polyfills in client-side code
if (typeof window !== 'undefined') {
  // IntersectionObserver polyfill (Safari < 12.1)
  // This is the most critical polyfill for modern web apps
  if (typeof IntersectionObserver === 'undefined') {
    // Dynamic import to avoid bundling in modern browsers
    import('intersection-observer').catch(() => {
      // Silently fail if polyfill can't be loaded
      // Feature will gracefully degrade
    });
  }

  // ResizeObserver polyfill (Safari < 13.1)
  if (typeof ResizeObserver === 'undefined') {
    import('resize-observer-polyfill').catch(() => {
      // Silently fail if polyfill can't be loaded
    });
  }
}

// Note: Most other polyfills (Promise, Array methods, etc.) are handled
// by Next.js SWC transpilation based on browserslist targets.
//
// For additional polyfills, consider:
// 1. Using Polyfill.io service (recommended for production)
// 2. Adding specific polyfills here as needed
// 3. Using feature detection before using APIs
