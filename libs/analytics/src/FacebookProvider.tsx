"use client";
import { useEffect, ReactNode } from "react";
import Script from "next/script";

export interface FacebookConfig {
  pixelId?: string;
  enableInDev?: boolean;
}

/**
 * Facebook Pixel Provider
 * 
 * Loads Facebook Pixel script and initializes tracking.
 * Handles environment detection and opt-out in development.
 * 
 * @example
 * ```tsx
 * // In your app layout
 * import { FacebookProvider } from '@ryla/analytics';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <FacebookProvider>
 *       {children}
 *     </FacebookProvider>
 *   );
 * }
 * ```
 */
export function FacebookProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: FacebookConfig;
}) {
  const pixelId =
    config.pixelId ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
    "2633023407061165";

  const isProduction = process.env.NODE_ENV === "production";
  const enableInDev = config.enableInDev || 
    process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

  // Skip initialization if not in production and dev tracking is disabled
  if (!isProduction && !enableInDev) {
    return <>{children}</>;
  }

  if (!pixelId) {
    console.warn(
      "⚠️ Facebook Pixel ID not found (NEXT_PUBLIC_FACEBOOK_PIXEL_ID), skipping initialization"
    );
    return <>{children}</>;
  }

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          (function() {
            // GUARD 1: Prevent entire script from executing twice
            if (window.__fbPixelsScriptExecuted) {
              return;
            }
            window.__fbPixelsScriptExecuted = true;
            
            // Load Facebook Pixel script
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize pixel after script loads
            (function() {
              // GUARD 2: Prevent init from running twice
              if (window.__fbPixelsInitStarted) {
                return;
              }
              window.__fbPixelsInitStarted = true;
              
              var pixelId = '${pixelId}';
              
              // GUARD 3: Validate pixel ID is numeric
              if (!/^[0-9]+$/.test(pixelId)) {
                console.error('[FB Pixel] Invalid pixel ID:', pixelId);
                return;
              }
              
              function initPixel() {
                if (typeof window.fbq !== 'function') {
                  setTimeout(initPixel, 50);
                  return;
                }
                
                // GUARD 4: Prevent fbq('init') from being called again
                if (window.__fbPixelInitialized) {
                  return;
                }
                
                window.fbq('init', pixelId);
                window.__fbPixelInitialized = true;
                
                // GUARD 5: Prevent PageView from being tracked multiple times
                if (!window.__fbPageViewTracked) {
                  window.fbq('track', 'PageView');
                  window.__fbPageViewTracked = true;
                }
              }
              
              // Start initialization
              initPixel();
            })();
          })();
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {children}
    </>
  );
}

