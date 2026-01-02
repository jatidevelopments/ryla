"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackTikTokPageView } from "./tiktok";

/**
 * TikTok PageView Component
 * 
 * Automatically tracks pageviews when route changes.
 * Should be placed inside TikTokProvider.
 * 
 * @example
 * ```tsx
 * import { TikTokProvider, TikTokPageView } from '@ryla/analytics';
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <TikTokProvider>
 *       <TikTokPageView />
 *       {children}
 *     </TikTokProvider>
 *   );
 * }
 * ```
 */
function TikTokPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track pageview on route change
    trackTikTokPageView();
  }, [pathname, searchParams]);

  return null;
}

export function TikTokPageView() {
  return (
    <Suspense fallback={null}>
      <TikTokPageViewInner />
    </Suspense>
  );
}

