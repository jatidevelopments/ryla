"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState, ReactNode } from "react";

export interface PostHogConfig {
  apiKey?: string;
  apiHost?: string;
  capturePageview?: boolean;
  enableInDev?: boolean;
}

/**
 * PostHog Analytics Provider
 * 
 * Wraps your app with PostHog analytics. Handles initialization,
 * environment detection, and opt-out in development.
 * 
 * @example
 * ```tsx
 * // In your app layout
 * import { ClientPostHogProvider } from '@ryla/analytics';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <ClientPostHogProvider>
 *       {children}
 *     </ClientPostHogProvider>
 *   );
 * }
 * ```
 */
export function ClientPostHogProvider({ 
  children,
  config = {}
}: { 
  children: ReactNode;
  config?: PostHogConfig;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [posthogClient, setPosthogClient] = useState<typeof posthog | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if PostHog is already initialized
    const isAlreadyLoaded =
      (window as any).posthog && typeof (window as any).posthog.capture === "function";

    if (isAlreadyLoaded) {
      setPosthogClient((window as any).posthog);
      setIsInitialized(true);
      return;
    }

    const isProduction = process.env.NODE_ENV === "production";
    
    // Get PostHog key from config or environment
    const posthogToken =
      config.apiKey ||
      process.env.NEXT_PUBLIC_POSTHOG_KEY ||
      process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

    if (!posthogToken) {
      console.warn(
        "⚠️ PostHog token not found (NEXT_PUBLIC_POSTHOG_KEY), skipping analytics initialization"
      );
      setIsInitialized(true);
      return;
    }

    // Get host from config or environment
    const posthogHost =
      config.apiHost ||
      process.env.NEXT_PUBLIC_POSTHOG_HOST ||
      "https://eu.i.posthog.com";

    try {
      posthog.init(posthogToken, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: config.capturePageview ?? false,
        loaded: (posthogInstance) => {
          console.log("✅ PostHog initialized successfully");

          // Make posthog available on window
          (window as any).posthog = posthogInstance;
          setPosthogClient(posthogInstance);

          const enableInDev = config.enableInDev || 
            process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

          if (!isProduction && !enableInDev) {
            posthogInstance.opt_out_capturing();
            console.log("PostHog opted out in development mode");
          } else {
            posthogInstance.opt_in_capturing();
            console.log("✅ PostHog tracking enabled");
          }

          setIsInitialized(true);
        },
      });
    } catch (error) {
      console.error("❌ PostHog initialization failed:", error);
      setIsInitialized(true);
    }
  }, [config]);

  // Check if posthog is available on window
  if (!isInitialized && typeof window !== "undefined") {
    const isAvailable =
      (window as any).posthog && typeof (window as any).posthog.capture === "function";
    if (isAvailable) {
      setPosthogClient((window as any).posthog);
      setIsInitialized(true);
    }
  }

  // Don't render PostHogProvider until we have the initialized client
  if (!posthogClient) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>;
}

