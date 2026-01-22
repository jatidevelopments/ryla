"use client";
import { ReactNode } from "react";
import Script from "next/script";

export interface TikTokConfig {
  pixelId?: string;
  enableInDev?: boolean;
}

/**
 * TikTok Pixel Provider
 * 
 * Loads TikTok pixel script and initializes tracking.
 * Handles environment detection and opt-out in development.
 * Uses Next.js Script component for optimal loading.
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
  const pixelId =
    config.pixelId ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ||
    "D56GRRRC77UAQNS9K9O0";

  const isProduction = process.env.NODE_ENV === "production";
  const enableInDev = config.enableInDev || 
    process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

  // Skip initialization if not in production and dev tracking is disabled
  if (!isProduction && !enableInDev) {
    return <>{children}</>;
  }

  if (!pixelId) {
    console.warn(
      "⚠️ TikTok pixel ID not found (NEXT_PUBLIC_TIKTOK_PIXEL_ID), skipping initialization"
    );
    return <>{children}</>;
  }

  return (
    <>
      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`
          (function() {
            // GUARD 1: Prevent entire script from executing twice
            if (window.__ttqScriptExecuted) {
              return;
            }
            window.__ttqScriptExecuted = true;
            
            // Load TikTok Pixel script
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;
              var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              
              // Initialize pixel after script loads
              (function() {
                // GUARD 2: Prevent init from running twice
                if (window.__ttqInitStarted) {
                  return;
                }
                window.__ttqInitStarted = true;
                
                var pixelId = '${pixelId}';
                
                // GUARD 3: Validate pixel ID format (alphanumeric)
                if (!/^[a-zA-Z0-9]+$/.test(pixelId)) {
                  console.error('[TikTok Pixel] Invalid pixel ID:', pixelId);
                  return;
                }
                
                function initPixel() {
                  if (typeof window.ttq !== 'object' || typeof window.ttq.load !== 'function') {
                    setTimeout(initPixel, 50);
                    return;
                  }
                  
                  // GUARD 4: Prevent ttq.load from being called again
                  if (window.__ttqPixelInitialized) {
                    return;
                  }
                  
                  window.ttq.load(pixelId);
                  window.__ttqPixelInitialized = true;
                  
                  // GUARD 5: Prevent PageView from being tracked multiple times
                  if (!window.__ttqPageViewTracked) {
                    window.ttq.page();
                    window.__ttqPageViewTracked = true;
                  }
                }
                
                // Start initialization
                initPixel();
              })();
            }(window, document, 'ttq');
          })();
        `}
      </Script>
      {children}
    </>
  );
}

