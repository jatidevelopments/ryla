// app/providers.tsx
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

export function ClientPosthogProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [posthogClient, setPosthogClient] = useState<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if PostHog is already initialized
        const isAlreadyLoaded =
            (window as any).posthog && typeof (window as any).posthog.capture === "function";

        if (isAlreadyLoaded) {
            console.log("PostHog already initialized");
            setPosthogClient((window as any).posthog);
            setIsInitialized(true);
            return;
        }

        // Check for NEXT_PUBLIC_POSTHOG_KEY (used on Fly.io) or NEXT_PUBLIC_POSTHOG_TOKEN (alternative name)
        // Use fallback values in production if not configured
        const isProduction = process.env.NODE_ENV === "production";
        const posthogToken =
            process.env.NEXT_PUBLIC_POSTHOG_KEY ||
            process.env.NEXT_PUBLIC_POSTHOG_TOKEN ||
            (isProduction ? "phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU" : undefined);

        // Skip PostHog initialization if token is not defined (only in non-production)
        if (!posthogToken) {
            console.warn(
                "⚠️ PostHog token not found (NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_TOKEN), skipping analytics initialization",
            );
            setIsInitialized(true); // Set to true to prevent blocking the app
            return;
        }

        // Use fallback host in production if not configured
        const posthogHost =
            process.env.NEXT_PUBLIC_POSTHOG_HOST ||
            (isProduction ? "https://us.i.posthog.com" : "https://eu.i.posthog.com");

        try {
            posthog.init(posthogToken, {
                api_host: posthogHost,
                person_profiles: "identified_only",
                capture_pageview: false, // Disable automatic pageview capture, as we capture manually
                loaded: (posthogInstance) => {
                    console.log("✅ PostHog initialized successfully");

                    // Make posthog available on window for safePostHogCapture
                    (window as any).posthog = posthogInstance;
                    setPosthogClient(posthogInstance);

                    if (
                        process.env.NODE_ENV === "development" &&
                        process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS !== "true"
                    ) {
                        posthogInstance.opt_out_capturing();
                        console.log("PostHog opted out in development mode");
                    } else {
                        // Explicitly opt in to ensure tracking is enabled
                        posthogInstance.opt_in_capturing();
                        console.log("✅ PostHog tracking enabled");
                    }

                    setIsInitialized(true);
                },
            });
        } catch (error) {
            console.error("❌ PostHog initialization failed:", error);
            setIsInitialized(true); // Set to true to prevent blocking the app
        }
    }, []);

    // Wait for initialization before rendering PostHogProvider
    // This ensures PostHog is available when components use usePostHog hook
    if (!isInitialized && typeof window !== "undefined") {
        // Check if posthog is available on window (might be initialized elsewhere)
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
