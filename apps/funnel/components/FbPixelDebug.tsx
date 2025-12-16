"use client";

import { useEffect } from "react";
import { getDebugStatus } from "@/lib/fbPixel";

/**
 * Client-side component to log Facebook Pixel configuration status
 * Only logs in browser console, doesn't render anything
 */
export function FbPixelDebug() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const status = getDebugStatus();
        const DEBUG_ENABLED =
            process.env.NEXT_PUBLIC_DEBUG_FB_PIXEL === "true" || (window as any).__DEBUG_FB_PIXEL__;

        console.group("🔵 Facebook Pixel Status");
        if (status.pixelIds && status.pixelIds.length > 1) {
            console.log("Pixel IDs:", status.pixelIds.join(", "));
            console.log("(Primary Pixel ID:", status.pixelId + ")");
        } else {
            console.log("Pixel ID:", status.pixelId);
        }
        console.log("fbq Available:", status.fbqAvailable ? "✅ Yes" : "❌ No");
        console.log("Debug Mode:", DEBUG_ENABLED ? "✅ Enabled" : "❌ Disabled");
        console.log("Queued Events:", status.queueLength);
        console.log(
            "Sent Event IDs:",
            status.sentEventIds.length > 0 ? status.sentEventIds : "None",
        );

        if (status.fbqAvailable) {
            console.log(
                "%c✅ Facebook Pixel is loaded and ready",
                "color: green; font-weight: bold",
            );
        } else {
            console.warn(
                "%c⚠️ Facebook Pixel (fbq) is not yet loaded",
                "color: orange; font-weight: bold",
            );
            console.log(
                "%c💡 Events will be queued until fbq is available",
                "color: blue; font-style: italic",
            );
        }

        if (DEBUG_ENABLED) {
            console.log(
                "%c💡 Debug mode enabled - all FB Pixel events will be logged",
                "color: blue; font-style: italic",
            );
        } else {
            console.log(
                "%c💡 Enable debug mode: Set NEXT_PUBLIC_DEBUG_FB_PIXEL=true or window.__DEBUG_FB_PIXEL__ = true",
                "color: blue; font-style: italic",
            );
        }

        console.groupEnd();

        // Monitor fbq availability changes
        let checkCount = 0;
        let wasAvailable = status.fbqAvailable; // Track previous state to detect transitions
        const maxChecks = 10;
        const checkInterval = setInterval(() => {
            checkCount++;
            const isAvailable = typeof (window as any).fbq === "function";

            // Only log when it transitions from unavailable to available (once)
            if (isAvailable && !wasAvailable && DEBUG_ENABLED) {
                console.log("[FB Pixel] ✅ fbq became available!");
                wasAvailable = true; // Update the tracked state so we don't log again
            }

            if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                if (!isAvailable && DEBUG_ENABLED) {
                    console.warn(
                        "[FB Pixel] ⚠️ fbq still not available after 5 seconds - check if script loaded correctly",
                    );
                }
            }
        }, 500);

        return () => {
            clearInterval(checkInterval);
        };
    }, []);

    return null; // This component doesn't render anything
}
