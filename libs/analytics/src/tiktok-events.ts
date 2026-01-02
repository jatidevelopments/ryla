/**
 * TikTok event mappings
 * 
 * Maps internal analytics events to TikTok standard events.
 * TikTok supports these standard events:
 * - CompleteRegistration
 * - Purchase
 * - AddToCart
 * - InitiateCheckout
 * - ViewContent
 * - Lead
 * - StartTrial
 * - Subscribe
 * - Contact
 * - Search
 * - AddToWishlist
 * - PlaceAnOrder
 * - AddPaymentInfo
 * - ClickButton
 * - Download
 * - FindLocation
 * - Schedule
 * - CustomizeProduct
 * - SubmitApplication
 * - ApplicationApproval
 * - Pageview
 */

import { trackTikTok } from "./tiktok";

/**
 * Map of internal event names to TikTok event names
 */
const TIKTOK_EVENT_MAP: Record<string, string> = {
  // User lifecycle
  "user.signed_up": "CompleteRegistration",
  "user.activated": "CompleteRegistration", // User completed onboarding

  // Conversion
  "subscription.created": "Purchase",
  "subscription.cancelled": "Contact", // User contacted support
  "trial.started": "StartTrial",
  "paywall.viewed": "ViewContent",

  // Core actions
  "core.action_started": "ViewContent",
  "core.action_completed": "ViewContent",

  // Onboarding
  "onboarding.completed": "CompleteRegistration",
};

/**
 * Track an event to TikTok using event mapping
 * 
 * @param eventName Internal event name (e.g., 'user.signed_up')
 * @param properties Event properties
 */
export function trackTikTokEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  const tiktokEventName = TIKTOK_EVENT_MAP[eventName];

  if (!tiktokEventName) {
    // Event not mapped, skip TikTok tracking
    if (process.env.NODE_ENV === "development") {
      console.log(`[TikTok] Event "${eventName}" not mapped to TikTok event`);
    }
    return;
  }

  // Transform properties to TikTok format if needed
  const tiktokProperties = transformPropertiesForTikTok(properties);

  trackTikTok(tiktokEventName, tiktokProperties);
}

/**
 * Transform internal properties to TikTok format
 */
function transformPropertiesForTikTok(
  properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!properties) return undefined;

  const transformed: Record<string, unknown> = {};

  // Map common property names
  if (properties.value !== undefined) {
    transformed.value = properties.value;
  }
  if (properties.currency) {
    transformed.currency = properties.currency;
  }
  if (properties.amount) {
    transformed.value = properties.amount;
  }

  // Map content properties
  if (properties.product_id || properties.content_id) {
    transformed.contents = [
      {
        content_id: properties.product_id || properties.content_id,
        content_type: properties.content_type || "product",
        content_name: properties.product_name || properties.content_name || "",
      },
    ];
  }

  // Pass through other properties
  Object.keys(properties).forEach((key) => {
    if (!["value", "currency", "amount", "product_id", "content_id", "product_name", "content_name", "content_type"].includes(key)) {
      transformed[key] = properties[key];
    }
  });

  return transformed;
}

/**
 * Direct TikTok event tracking functions for common events
 */

export function trackTikTokPurchase(properties: {
  value: number;
  currency: string;
  content_id?: string;
  content_name?: string;
}): void {
  trackTikTok("Purchase", {
    value: properties.value,
    currency: properties.currency,
    contents: properties.content_id
      ? [
          {
            content_id: properties.content_id,
            content_type: "product",
            content_name: properties.content_name || "",
          },
        ]
      : undefined,
  });
}

export function trackTikTokCompleteRegistration(properties?: {
  value?: number;
  currency?: string;
}): void {
  trackTikTok("CompleteRegistration", properties);
}

export function trackTikTokStartTrial(properties?: {
  value?: number;
  currency?: string;
}): void {
  trackTikTok("StartTrial", properties);
}

export function trackTikTokViewContent(properties?: {
  content_id?: string;
  content_name?: string;
  value?: number;
  currency?: string;
}): void {
  trackTikTok("ViewContent", {
    ...properties,
    contents: properties?.content_id
      ? [
          {
            content_id: properties.content_id,
            content_type: "product",
            content_name: properties.content_name || "",
          },
        ]
      : undefined,
  });
}

export function trackTikTokLead(properties?: {
  value?: number;
  currency?: string;
}): void {
  trackTikTok("Lead", properties);
}

