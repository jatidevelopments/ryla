"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    // Track pageviews only on client side
    if (typeof window !== "undefined" && pathname && posthog && searchParams) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

/**
 * PostHog Page View Tracker
 * 
 * Automatically tracks page views when the URL changes.
 * Must be used within a ClientPostHogProvider.
 * 
 * @example
 * ```tsx
 * // In your app layout
 * import { PostHogPageView } from '@ryla/analytics';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <ClientPostHogProvider>
 *       <PostHogPageView />
 *       {children}
 *     </ClientPostHogProvider>
 *   );
 * }
 * ```
 */
export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}

export default PostHogPageView;

