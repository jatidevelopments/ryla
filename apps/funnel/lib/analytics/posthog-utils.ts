// PostHog Utilities - Safe PostHog usage with fallbacks

export function isPostHogAvailable(): boolean {
  return typeof window !== 'undefined' && 
         (window as any).posthog && 
         typeof (window as any).posthog.capture === 'function';
}

export function safePostHogCapture(eventName: string, properties?: Record<string, any>): void {
  if (isPostHogAvailable()) {
    try {
      (window as any).posthog.capture(eventName, properties);
    } catch (error) {
      console.warn('PostHog capture failed:', error);
    }
  } else {
    // Fallback to console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}:`, properties);
    }
  }
}

export function safePostHogIdentify(userId: string, properties?: Record<string, any>): void {
  if (isPostHogAvailable()) {
    try {
      (window as any).posthog.identify(userId, properties);
    } catch (error) {
      console.warn('PostHog identify failed:', error);
    }
  } else {
    // Fallback to console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Identify ${userId}:`, properties);
    }
  }
}

export function safePostHogSetProperties(properties: Record<string, any>): void {
  if (isPostHogAvailable()) {
    try {
      (window as any).posthog.setPersonProperties(properties);
    } catch (error) {
      console.warn('PostHog set properties failed:', error);
    }
  } else {
    // Fallback to console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Set properties:`, properties);
    }
  }
}

export function safePostHogReset(): void {
  if (isPostHogAvailable()) {
    try {
      (window as any).posthog.reset();
    } catch (error) {
      console.warn('PostHog reset failed:', error);
    }
  } else {
    // Fallback to console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Reset`);
    }
  }
}
