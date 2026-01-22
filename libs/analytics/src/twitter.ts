/**
 * Twitter/X Pixel tracking functions
 * 
 * Provides functions to track events using Twitter/X Pixel (twq).
 * All functions check if Twitter pixel is available before tracking.
 */

declare global {
  interface Window {
    twq?: (...args: any[]) => void;
    __DEBUG_TWITTER_PIXEL__?: boolean;
  }
}

// Debug mode: enabled via NEXT_PUBLIC_DEBUG_TWITTER_PIXEL or window.__DEBUG_TWITTER_PIXEL__
const DEBUG_TWITTER_PIXEL =
  (typeof window !== "undefined" &&
    (process.env.NEXT_PUBLIC_DEBUG_TWITTER_PIXEL === "true" ||
      window.__DEBUG_TWITTER_PIXEL__)) ||
  false;

/**
 * Check if Twitter/X Pixel is available
 */
export function isTwitterAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.twq === "function";
}

/**
 * Safe wrapper for Twitter/X Pixel tracking
 * Queues events if twq is not yet loaded
 */
const queue: Array<() => void> = [];

function flushQueue() {
  if (DEBUG_TWITTER_PIXEL && queue.length > 0) {
    console.log(`[Twitter] Flushing ${queue.length} queued events`);
  }
  while (queue.length) queue.shift()?.();
}

function safeTwq(...args: any[]) {
  if (typeof window === "undefined") return;

  if (DEBUG_TWITTER_PIXEL) {
    const [action, eventName, params] = args;
    console.log(
      `[Twitter] ${
        action === "config" || action === "init"
          ? "🔵 Initializing"
          : action === "track"
            ? "📊 Tracking"
            : action === "event"
              ? "🎯 Conversion Event"
              : "⚙️ Action"
      }:`,
      {
        action,
        event: eventName,
        params: params || {},
        twqAvailable: typeof window.twq === "function",
        queueLength: queue.length,
      }
    );
  }

  if (typeof window.twq === "function") {
    window.twq(...args);
    flushQueue();
  } else {
    if (DEBUG_TWITTER_PIXEL) {
      console.log(`[Twitter] ⏳ Queuing event (twq not loaded yet):`, args);
    }
    queue.push(() => window.twq?.(...args));
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
 * Track a Twitter/X event using standard event names
 * 
 * @param eventName Event name (e.g., 'Purchase', 'Lead', 'CompleteRegistration')
 * @param properties Event properties
 * 
 * @example
 * ```ts
 * trackTwitter('Purchase', {
 *   value: 29.99,
 *   currency: 'USD',
 *   content_id: 'subscription',
 *   content_name: 'Monthly Plan'
 * });
 * ```
 */
export function trackTwitter(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (DEBUG_TWITTER_PIXEL) {
    console.log(`[Twitter] 📊 trackTwitter called`, {
      eventName,
      properties: properties || {},
      twqAvailable: typeof window.twq === "function",
    });
  }

  if (properties) {
    safeTwq("track", eventName, properties);
  } else {
    safeTwq("track", eventName);
  }
}

/**
 * Track a Twitter/X event using event ID (Twitter/X conversion tracking format)
 * 
 * @param eventId Event ID from Twitter Ads (e.g., 'tw-qwgn6-qwgn7')
 * @param properties Event properties
 * 
 * @example
 * ```ts
 * trackTwitterEvent('tw-qwgn6-qwgn7', {
 *   value: 29.99,
 *   conversion_id: 'order-123',
 *   phone_number: '+1234567890'
 * });
 * ```
 */
export function trackTwitterEvent(
  eventId: string,
  properties?: Record<string, unknown>
): void {
  if (DEBUG_TWITTER_PIXEL) {
    console.log(`[Twitter] 📊 trackTwitterEvent called`, {
      eventId,
      properties: properties || {},
      twqAvailable: typeof window.twq === "function",
    });
  }

  if (properties) {
    safeTwq("event", eventId, properties);
  } else {
    safeTwq("event", eventId);
  }
}

/**
 * Track a PageView event
 * Usually called automatically on page load, but can be used manually
 * Note: Twitter/X pixel tracks PageView automatically after config
 */
export function trackTwitterPageView(): void {
  if (DEBUG_TWITTER_PIXEL) {
    console.log(`[Twitter] 📄 trackPageView called`);
  }
  // Twitter/X tracks PageView automatically, but we can manually track if needed
  safeTwq("track", "PageView");
}

/**
 * Get the Twitter/X Pixel ID
 * Useful for debugging
 */
export function getTwitterPixelId(): string {
  return process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID || "";
}

/**
 * Get debug status
 */
export function getTwitterDebugStatus() {
  return {
    enabled: DEBUG_TWITTER_PIXEL,
    pixelId: getTwitterPixelId(),
    twqAvailable: typeof window !== "undefined" && typeof window.twq === "function",
    queueLength: queue.length,
    sentEventIds: Array.from(sentEventIds),
  };
}
