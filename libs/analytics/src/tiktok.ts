/**
 * TikTok Pixel tracking functions
 * 
 * Provides functions to track events using TikTok Pixel SDK.
 * All functions check if TikTok pixel is available before tracking.
 */

/**
 * Check if TikTok pixel is available
 */
export function isTikTokAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof (window as any).ttq === "object" &&
    typeof (window as any).ttq.track === "function"
  );
}

/**
 * Track a TikTok event
 * 
 * @param eventName TikTok event name (e.g., 'CompleteRegistration', 'Purchase')
 * @param properties Event properties
 * 
 * @example
 * ```ts
 * trackTikTok('CompleteRegistration', {
 *   value: 29.99,
 *   currency: 'USD',
 *   contents: [{
 *     content_id: 'subscription',
 *     content_type: 'product',
 *     content_name: 'Monthly Subscription'
 *   }]
 * });
 * ```
 */
export function trackTikTok(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isTikTokAvailable()) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[TikTok] ${eventName}:`, properties);
    }
    return;
  }

  try {
    (window as any).ttq.track(eventName, properties);
  } catch (error) {
    console.warn("TikTok track failed:", error);
  }
}

/**
 * Identify a user for TikTok tracking
 * 
 * @param userData User identification data (email, phone, external_id)
 * Note: Email and phone should be SHA-256 hashed before passing
 * 
 * @example
 * ```ts
 * identifyTikTok({
 *   email: hashedEmail, // SHA-256 hashed
 *   phone_number: hashedPhone, // SHA-256 hashed
 *   external_id: hashedUserId // SHA-256 hashed
 * });
 * ```
 */
export function identifyTikTok(userData: {
  email?: string;
  phone_number?: string;
  external_id?: string;
}): void {
  if (!isTikTokAvailable()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[TikTok] identify:", userData);
    }
    return;
  }

  try {
    (window as any).ttq.identify(userData);
  } catch (error) {
    console.warn("TikTok identify failed:", error);
  }
}

/**
 * Track a pageview
 */
export function trackTikTokPageView(): void {
  if (!isTikTokAvailable()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[TikTok] pageview");
    }
    return;
  }

  try {
    (window as any).ttq.page();
  } catch (error) {
    console.warn("TikTok pageview failed:", error);
  }
}

/**
 * Hash a string using SHA-256
 * Used for hashing PII (email, phone) before sending to TikTok
 * 
 * @param value String to hash
 * @returns Promise resolving to hashed hex string
 */
export async function hashSHA256(value: string): Promise<string> {
  if (typeof window === "undefined") {
    // Server-side: use Node.js crypto
    const crypto = await import("crypto");
    return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
  }

  // Client-side: use Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

