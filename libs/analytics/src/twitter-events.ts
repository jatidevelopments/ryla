/**
 * Twitter/X event mappings
 * 
 * Maps internal analytics events to Twitter/X standard events.
 * Twitter/X supports these standard events:
 * - PageView
 * - Purchase
 * - CompleteRegistration
 * - Lead
 * - AddToCart
 * - InitiateCheckout
 * - ViewContent
 * - StartTrial
 * - Subscribe
 * - Search
 * - AddToWishlist
 * - PlaceAnOrder
 * - AddPaymentInfo
 */

import { trackTwitter, trackTwitterEvent as trackTwitterEventById } from "./twitter";

/**
 * Map of internal event names to Twitter/X event names
 */
const TWITTER_EVENT_MAP: Record<string, string> = {
  // User lifecycle
  "user.signed_up": "CompleteRegistration",
  "user.activated": "CompleteRegistration", // User completed onboarding

  // Conversion
  "subscription.created": "Purchase",
  "subscription.cancelled": "Subscribe", // User cancelled subscription
  "trial.started": "StartTrial",
  "paywall.viewed": "ViewContent",

  // Core actions
  "core.action_started": "ViewContent",
  "core.action_completed": "ViewContent",

  // Onboarding
  "onboarding.completed": "CompleteRegistration",
};

/**
 * Track an event to Twitter/X using event mapping
 * Maps internal event names to Twitter/X standard events.
 * 
 * @param eventName Internal event name (e.g., 'user.signed_up')
 * @param properties Event properties
 */
export function trackTwitterMappedEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  const twitterEventName = TWITTER_EVENT_MAP[eventName];

  if (!twitterEventName) {
    // Event not mapped, skip Twitter tracking
    if (process.env.NODE_ENV === "development") {
      console.log(`[Twitter] Event "${eventName}" not mapped to Twitter event`);
    }
    return;
  }

  // Transform properties to Twitter format if needed
  const twitterProperties = transformPropertiesForTwitter(properties);

  trackTwitter(twitterEventName, twitterProperties);
}

/**
 * Transform internal properties to Twitter/X format
 */
function transformPropertiesForTwitter(
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
    transformed.content_id = properties.product_id || properties.content_id;
    transformed.content_name = properties.product_name || properties.content_name || "";
  }

  // Pass through other properties
  Object.keys(properties).forEach((key) => {
    if (!["value", "currency", "amount", "product_id", "content_id", "product_name", "content_name"].includes(key)) {
      transformed[key] = properties[key];
    }
  });

  return transformed;
}

/**
 * Direct Twitter/X event tracking functions for common events
 */

/**
 * Track a Purchase event using Twitter/X conversion tracking format
 * Uses event ID from NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID
 * 
 * @param properties Purchase event properties
 */
export function trackTwitterPurchase(properties: {
  value: number;
  currency: string;
  content_id?: string;
  content_name?: string;
  conversion_id?: string; // For deduplication (e.g., order ID)
  phone_number?: string; // Phone number in E164 format
  event_id?: string; // Legacy support, use conversion_id instead
}): void {
  const purchaseEventId = 
    process.env.NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID;
  
  if (purchaseEventId) {
    // Use Twitter/X conversion tracking format with event ID
    trackTwitterEventById(purchaseEventId, {
      value: properties.value,
      conversion_id: properties.conversion_id || properties.event_id,
      phone_number: properties.phone_number,
    });
  } else {
    // Fallback to standard event format
    const { event_id, conversion_id, phone_number, ...trackingProps } = properties;
    trackTwitter("Purchase", {
      ...trackingProps,
    });
  }
}

export function trackTwitterCompleteRegistration(properties?: {
  value?: number;
  currency?: string;
}): void {
  trackTwitter("CompleteRegistration", properties);
}

export function trackTwitterStartTrial(properties?: {
  value?: number;
  currency?: string;
}): void {
  trackTwitter("StartTrial", properties);
}

export function trackTwitterViewContent(properties?: {
  content_id?: string;
  content_name?: string;
  value?: number;
  currency?: string;
}): void {
  trackTwitter("ViewContent", properties);
}

/**
 * Track a Lead event using Twitter/X conversion tracking format
 * Uses event ID from NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID
 * 
 * @param properties Lead event properties
 */
export function trackTwitterLead(properties?: {
  email_address?: string; // User's email address
  phone_number?: string; // Phone number in E164 format
  value?: number;
  currency?: string;
}): void {
  const leadEventId = 
    process.env.NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID;
  
  if (leadEventId) {
    // Use Twitter/X conversion tracking format with event ID
    trackTwitterEventById(leadEventId, {
      email_address: properties?.email_address,
      phone_number: properties?.phone_number,
    });
  } else {
    // Fallback to standard event format
    trackTwitter("Lead", properties);
  }
}

export function trackTwitterAddToCart(properties?: {
  value?: number;
  currency?: string;
  content_id?: string;
  content_name?: string;
}): void {
  trackTwitter("AddToCart", properties);
}

export function trackTwitterInitiateCheckout(properties?: {
  value?: number;
  currency?: string;
  content_id?: string;
  content_name?: string;
}): void {
  trackTwitter("InitiateCheckout", properties);
}
