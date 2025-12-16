const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "");

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value) || value.startsWith("data:");

// Debug logging for CDN usage
const DEBUG_CDN = process.env.NEXT_PUBLIC_DEBUG_CDN === "true" || (typeof window !== "undefined" && (window as any).__DEBUG_CDN__);

/**
 * Prefixes a relative asset path with the configured CDN URL (if provided).
 * Falls back to the original path during local development or when the value
 * already points to an absolute URL.
 */
export const withCdn = (path: string | undefined | null): string => {
    if (!path) return "";

    if (isAbsoluteUrl(path)) {
        if (DEBUG_CDN) {
            console.log(`[CDN] Already absolute URL, skipping: ${path}`);
        }
        return path;
    }

    if (!CDN_URL) {
        if (DEBUG_CDN) {
            console.log(`[CDN] No CDN URL configured, using original path: ${path}`);
        }
        return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const cdnUrl = `${CDN_URL}${normalizedPath}`;
    
    if (DEBUG_CDN) {
        console.log(`[CDN] ✅ Using CDN: ${path} → ${cdnUrl}`);
    }
    
    return cdnUrl;
};

/**
 * Get CDN configuration status (for debugging)
 */
export const getCdnStatus = () => {
    return {
        enabled: !!CDN_URL,
        url: CDN_URL || "Not configured",
        debug: DEBUG_CDN,
    };
};
