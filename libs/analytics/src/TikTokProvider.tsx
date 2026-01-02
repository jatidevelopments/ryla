"use client";
import { useEffect, useState, ReactNode } from "react";

export interface TikTokConfig {
  pixelId?: string;
  enableInDev?: boolean;
}

/**
 * TikTok Pixel Provider
 * 
 * Loads TikTok pixel script and initializes tracking.
 * Handles environment detection and opt-out in development.
 * 
 * @example
 * ```tsx
 * // In your app layout
 * import { TikTokProvider } from '@ryla/analytics';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <TikTokProvider>
 *       {children}
 *     </TikTokProvider>
 *   );
 * }
 * ```
 */
export function TikTokProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: TikTokConfig;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  const pixelId =
    config.pixelId ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ||
    "D56GRRRC77UAQNS9K9O0";

  const isProduction = process.env.NODE_ENV === "production";
  const enableInDev = config.enableInDev || 
    process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if TikTok pixel is already loaded
    const isAlreadyLoaded =
      (window as any).ttq && typeof (window as any).ttq.track === "function";

    if (isAlreadyLoaded) {
      setIsInitialized(true);
      return;
    }

    // Skip initialization if not in production and dev tracking is disabled
    if (!isProduction && !enableInDev) {
      console.log("TikTok pixel skipped in development mode");
      setIsInitialized(true);
      return;
    }

    // Initialize TikTok pixel
    if (!pixelId) {
      console.warn(
        "⚠️ TikTok pixel ID not found (NEXT_PUBLIC_TIKTOK_PIXEL_ID), skipping initialization"
      );
      setIsInitialized(true);
      return;
    }

    // The pixel script will be loaded via Script component
    // This effect just marks initialization as ready
    setIsInitialized(true);
  }, [pixelId, isProduction, enableInDev]);

  if (!pixelId) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (typeof window === "undefined" || !pixelId) return;

    // Check if already loaded
    if ((window as any).ttq && typeof (window as any).ttq.track === "function") {
      return;
    }

    // Load TikTok pixel script
    const script = document.createElement("script");
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
        var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
        ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    script.id = "tiktok-pixel";
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const existing = document.getElementById("tiktok-pixel");
      if (existing) {
        existing.remove();
      }
    };
  }, [pixelId]);

  return <>{children}</>;
}

