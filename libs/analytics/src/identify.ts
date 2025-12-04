/**
 * Identify a user for analytics
 * @param userId User ID
 * @param traits User traits
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.identify(userId, traits);
  }
}

/**
 * Reset user identification (on logout)
 */
export function reset(): void {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.reset();
  }
}

