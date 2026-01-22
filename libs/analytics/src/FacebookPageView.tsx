"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackFacebookPageView } from "./facebook";

/**
 * Facebook PageView Component
 * 
 * Automatically tracks pageviews when route changes.
 * Should be placed inside FacebookProvider.
 * 
 * Note: Facebook Pixel also tracks PageView automatically on init,
 * but this component ensures PageView is tracked on route changes.
 * 
 * @example
 * ```tsx
 * import { FacebookProvider, FacebookPageView } from '@ryla/analytics';
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <FacebookProvider>
 *       <FacebookPageView />
 *       {children}
 *     </FacebookProvider>
 *   );
 * }
 * ```
 */
function FacebookPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track pageview on route change
    trackFacebookPageView();
  }, [pathname, searchParams]);

  return null;
}

export function FacebookPageView() {
  return (
    <Suspense fallback={null}>
      <FacebookPageViewInner />
    </Suspense>
  );
}
