"use client";

import { useState, useEffect } from "react";

/**
 * Hook to check if finby popup.js is loaded and ready
 * finby requires jQuery and popup.js to be loaded
 */
export function useFinbyReady() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total

        const checkFinby = () => {
            attempts++;

            // Check if jQuery is loaded (required by finby)
            const hasJQuery = typeof window !== "undefined" && typeof (window as any).jQuery !== "undefined";
            
            // Check if finby popup function is available
            const hasFinbyPopup = typeof window !== "undefined" && typeof (window as any).openPopup === "function";

            if (hasJQuery && hasFinbyPopup) {
                setIsReady(true);
                setError(null);
            } else if (attempts >= maxAttempts) {
                setError("finby failed to load within 5 seconds. jQuery or popup.js may be missing.");
                setIsReady(false);
            } else {
                setTimeout(checkFinby, 100);
            }
        };

        checkFinby();
    }, []);

    return { isReady, error };
}

