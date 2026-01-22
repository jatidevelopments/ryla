"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackTwitterPageView } from "./twitter";

/**
 * Twitter/X PageView Component
 * 
 * Automatically tracks pageviews when route changes.
 * Should be placed inside TwitterProvider.
 * 
 * @example
 * ```tsx
 * import { TwitterProvider, TwitterPageView } from '@ryla/analytics';
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <TwitterProvider>
 *       <TwitterPageView />
 *       {children}
 *     </TwitterProvider>
 *   );
 * }
 * ```
 */
function TwitterPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track pageview on route change
    trackTwitterPageView();
  }, [pathname, searchParams]);

  return null;
}

export function TwitterPageView() {
  return (
    <Suspense fallback={null}>
      <TwitterPageViewInner />
    </Suspense>
  );
}
