/**
 * Capture an analytics event
 * @param event Event name in feature.action format
 * @param properties Event properties
 */
export function capture(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
}

