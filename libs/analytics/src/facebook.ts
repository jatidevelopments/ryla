/**
 * Facebook Pixel tracking functions
 * 
 * Provides functions to track events using Facebook Pixel.
 * All functions check if Facebook Pixel is available before tracking.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    __DEBUG_FB_PIXEL__?: boolean;
  }
}

// Debug mode: enabled via NEXT_PUBLIC_DEBUG_FB_PIXEL or window.__DEBUG_FB_PIXEL__
const DEBUG_FB_PIXEL =
  (typeof window !== "undefined" &&
    (process.env.NEXT_PUBLIC_DEBUG_FB_PIXEL === "true" ||
      window.__DEBUG_FB_PIXEL__)) ||
  false;

/**
 * Check if Facebook Pixel is available
 */
export function isFacebookAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.fbq === "function";
}

/**
 * Safe wrapper for Facebook Pixel tracking
 * Queues events if fbq is not yet loaded
 */
const queue: Array<() => void> = [];

function flushQueue() {
  if (DEBUG_FB_PIXEL && queue.length > 0) {
    console.log(`[FB Pixel] Flushing ${queue.length} queued events`);
  }
  while (queue.length) queue.shift()?.();
}

function safeFbq(...args: any[]) {
  if (typeof window === "undefined") return;

  if (DEBUG_FB_PIXEL) {
    const [action, eventName, params] = args;
    console.log(
      `[FB Pixel] ${
        action === "init"
          ? "🔵 Initializing"
          : action === "track"
            ? "📊 Tracking"
            : "⚙️ Action"
      }:`,
      {
        action,
        event: eventName,
        params: params || {},
        fbqAvailable: typeof window.fbq === "function",
        queueLength: queue.length,
      }
    );
  }

  if (typeof window.fbq === "function") {
    window.fbq(...args);
    flushQueue();
  } else {
    if (DEBUG_FB_PIXEL) {
      console.log(`[FB Pixel] ⏳ Queuing event (fbq not loaded yet):`, args);
    }
    queue.push(() => window.fbq?.(...args));
  }
}

// Deduplication tracking
const sentEventIds = new Set<string>();

function withDedup(eventId?: string, fn?: () => void) {
  if (!eventId) return fn?.();
  if (sentEventIds.has(eventId)) return;
  sentEventIds.add(eventId);
  fn?.();
}

/**
 * Track a Lead event
 * Should be called after successful signup/registration
 * 
 * @param eventId Optional event ID for deduplication
 */
export function trackFacebookLead(eventId?: string): void {
  if (DEBUG_FB_PIXEL) {
    console.log(`[FB Pixel] 🎯 trackLead called`, {
      eventId,
      alreadySent: eventId ? sentEventIds.has(eventId) : false,
    });
  }
  withDedup(eventId, () => {
    safeFbq("track", "Lead");
  });
}

/**
 * Track a Purchase event
 * 
 * @param value Purchase value (subtotal price)
 * @param currency Currency code (default: "USD")
 * @param eventId Optional event ID for deduplication
 */
export function trackFacebookPurchase(
  value: number,
  currency: string = "USD",
  eventId?: string
): void {
  if (DEBUG_FB_PIXEL) {
    console.log(`[FB Pixel] 💰 trackPurchase called`, {
      value,
      currency,
      eventId,
      alreadySent: eventId ? sentEventIds.has(eventId) : false,
    });
  }
  withDedup(eventId, () => {
    safeFbq("track", "Purchase", {
      value,
      currency,
    });
  });
}

/**
 * Track a PageView event
 * Usually called automatically on page load, but can be used manually
 */
export function trackFacebookPageView(): void {
  if (DEBUG_FB_PIXEL) {
    console.log(`[FB Pixel] 📄 trackPageView called`);
  }
  safeFbq("track", "PageView");
}

/**
 * Track an AddToCart event
 * Should be called when user adds item to cart or opens payment form
 */
export function trackFacebookAddToCart(params?: {
  content_ids?: string[];
  content_name?: string;
  value?: number;
  currency?: string;
}): void {
  if (DEBUG_FB_PIXEL) {
    console.log(`[FB Pixel] 🛒 trackAddToCart called`, params || {});
  }
  safeFbq("track", "AddToCart", params);
}

/**
 * Track a ViewContent event
 * Should be called when user views specific content
 */
export function trackFacebookViewContent(params?: Record<string, any>): void {
  if (DEBUG_FB_PIXEL) {
    console.log(`[FB Pixel] 👁️ trackViewContent called`, params || {});
  }
  safeFbq("track", "ViewContent", params);
}

/**
 * Get the Facebook Pixel ID
 * Useful for noscript fallback images
 */
export function getFacebookPixelId(): string {
  return (
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "2633023407061165"
  );
}

/**
 * Get debug status
 */
export function getFacebookDebugStatus() {
  return {
    enabled: DEBUG_FB_PIXEL,
    pixelId: getFacebookPixelId(),
    fbqAvailable: typeof window !== "undefined" && typeof window.fbq === "function",
    queueLength: queue.length,
    sentEventIds: Array.from(sentEventIds),
  };
}

