"use client";

import { useState, useEffect } from "react";

export function useShift4Ready() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 50;

        const checkShift4 = () => {
            attempts++;

            if (typeof window !== "undefined" && typeof (window as any).Shift4 === "function") {
                setIsReady(true);
                setError(null);
            } else if (attempts >= maxAttempts) {
                setError("Shift4 failed to load within 5 seconds");
                setIsReady(false);
            } else {
                setTimeout(checkShift4, 100);
            }
        };

        checkShift4();
    }, []);

    return { isReady, error };
}
