"use client";

import { useEffect } from "react";
import { getCdnStatus } from "@/lib/cdn";

/**
 * Client-side component to log CDN configuration status
 * Only logs in browser console, doesn't render anything
 */
export function CdnDebug() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const status = getCdnStatus();
        
        console.group("🌐 CDN Configuration Status");
        console.log("Enabled:", status.enabled ? "✅ Yes" : "❌ No");
        console.log("CDN URL:", status.url);
        console.log("Debug Mode:", status.debug ? "✅ Enabled" : "❌ Disabled");
        
        if (status.enabled) {
            console.log(
                "%c✅ Bunny.net CDN is configured and will be used for static assets",
                "color: green; font-weight: bold"
            );
            console.log(
                "%c💡 Tip: Enable detailed debug mode by setting NEXT_PUBLIC_DEBUG_CDN=true or window.__DEBUG_CDN__ = true",
                "color: blue; font-style: italic"
            );
        } else {
            console.warn(
                "%c⚠️ CDN is not configured. Static assets will be served from origin.",
                "color: orange; font-weight: bold"
            );
            console.log(
                "%c💡 To enable: Set NEXT_PUBLIC_CDN_URL environment variable (e.g., https://rylaai.b-cdn.net)",
                "color: blue; font-style: italic"
            );
        }
        
        // Log asset prefix from Next.js
        const assetPrefix = (window as any).__NEXT_DATA__?.assetPrefix;
        if (assetPrefix) {
            console.log("Next.js assetPrefix:", assetPrefix);
        }
        
        console.groupEnd();
        
        // Track image loads via CDN (only in debug mode)
        if (status.enabled && status.debug) {
            let cdnImageCount = 0;
            let originImageCount = 0;
            
            // Track image loads by observing network requests
            const trackImageLoad = (src: string) => {
                if (!src) return;
                
                if (src.includes(status.url)) {
                    cdnImageCount++;
                    console.log(
                        `%c[CDN Image ${cdnImageCount}] ✅ Loaded via CDN`,
                        "color: green; font-weight: bold",
                        src
                    );
                } else if (src.startsWith("/") || src.includes(window.location.origin)) {
                    originImageCount++;
                    console.log(
                        `%c[CDN Image ${originImageCount}] ⚠️ Loaded from origin`,
                        "color: orange; font-weight: bold",
                        src
                    );
                }
            };
            
            // Observe all img elements being added to the DOM
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const element = node as HTMLElement;
                            
                            // Check if the node itself is an img
                            if (element.tagName === "IMG" && element.getAttribute("src")) {
                                trackImageLoad(element.getAttribute("src") || "");
                            }
                            
                            // Check for img children
                            const imgs = element.querySelectorAll("img[src]");
                            imgs.forEach((img) => {
                                trackImageLoad(img.getAttribute("src") || "");
                            });
                        }
                    });
                });
            });
            
            // Also check existing images
            document.querySelectorAll("img[src]").forEach((img) => {
                trackImageLoad(img.getAttribute("src") || "");
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
            
            // Track via Performance API
            const performanceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name && (entry.name.includes(".png") || entry.name.includes(".jpg") || entry.name.includes(".webp") || entry.name.includes(".svg"))) {
                        trackImageLoad(entry.name);
                    }
                });
            });
            
            try {
                performanceObserver.observe({ entryTypes: ["resource"] });
            } catch {
                // Performance API might not be available
            }
            
            return () => {
                observer.disconnect();
                performanceObserver.disconnect();
            };
        }
    }, []);

    return null; // This component doesn't render anything
}

