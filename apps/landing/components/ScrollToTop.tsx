'use client';

import { useEffect } from 'react';

/**
 * ScrollToTop Component
 *
 * Prevents automatic scrolling to hash anchors on initial page load
 * unless the URL explicitly contains a hash.
 */
export function ScrollToTop() {
  useEffect(() => {
    // Only scroll to top if there's no hash in the URL
    // This prevents unwanted scrolling when the page loads
    if (!window.location.hash) {
      // Scroll to top immediately on mount
      window.scrollTo(0, 0);

      // Also prevent any smooth scroll behavior on initial load
      // by temporarily disabling it
      const html = document.documentElement;
      const originalScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';

      // Force scroll to top
      window.scrollTo(0, 0);

      // Restore smooth scroll after a brief delay
      setTimeout(() => {
        html.style.scrollBehavior = originalScrollBehavior || 'smooth';
      }, 100);
    }
  }, []);

  return null;
}
