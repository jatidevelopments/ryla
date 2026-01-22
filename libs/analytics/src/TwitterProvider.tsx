"use client";
import { ReactNode } from "react";
import Script from "next/script";

export interface TwitterConfig {
  pixelId?: string;
  enableInDev?: boolean;
}

/**
 * Twitter/X Pixel Provider
 * 
 * Loads Twitter/X pixel script (twq) and initializes tracking.
 * Handles environment detection and opt-out in development.
 * 
 * @example
 * ```tsx
 * // In your app layout
 * import { TwitterProvider } from '@ryla/analytics';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <TwitterProvider>
 *       {children}
 *     </TwitterProvider>
 *   );
 * }
 * ```
 */
export function TwitterProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: TwitterConfig;
}) {
  const pixelId =
    config.pixelId ||
    process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID;

  const isProduction = process.env.NODE_ENV === "production";
  const enableInDev = config.enableInDev || 
    process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

  // Skip initialization if not in production and dev tracking is disabled
  if (!isProduction && !enableInDev) {
    return <>{children}</>;
  }

  if (!pixelId) {
    console.warn(
      "⚠️ Twitter/X Pixel ID not found (NEXT_PUBLIC_TWITTER_PIXEL_ID), skipping initialization"
    );
    return <>{children}</>;
  }

  return (
    <>
      <Script id="twitter-pixel" strategy="afterInteractive">
        {`
          (function() {
            // GUARD 1: Prevent entire script from executing twice
            if (window.__twqScriptExecuted) {
              return;
            }
            window.__twqScriptExecuted = true;
            
            // Load Twitter/X Pixel script
            !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            
            // Initialize pixel after script loads
            (function() {
              // GUARD 2: Prevent init from running twice
              if (window.__twqInitStarted) {
                return;
              }
              window.__twqInitStarted = true;
              
              var pixelId = '${pixelId}';
              
              // GUARD 3: Validate pixel ID format (alphanumeric)
              if (!/^[a-zA-Z0-9]+$/.test(pixelId)) {
                console.error('[Twitter Pixel] Invalid pixel ID:', pixelId);
                return;
              }
              
              function initPixel() {
                if (typeof window.twq !== 'function') {
                  setTimeout(initPixel, 50);
                  return;
                }
                
                // GUARD 4: Prevent twq('config') from being called again
                if (window.__twqPixelInitialized) {
                  return;
                }
                
                // Use 'config' instead of 'init' (Twitter/X conversion tracking format)
                // Format: twq('config', 'qwgn6')
                window.twq('config', pixelId);
                window.__twqPixelInitialized = true;
                
                // Note: PageView is tracked automatically by Twitter/X pixel after config
                // No need to manually track PageView on init
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
          src={`https://analytics.twitter.com/i/adsct?txn_id=${pixelId}&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0`}
          alt=""
        />
      </noscript>
      {children}
    </>
  );
}
