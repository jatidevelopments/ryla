// Analytics library - @ryla/analytics
// Export public API

// Core capture functions
export * from './capture';
export * from './identify';
export * from './events';

// PostHog React components
export { ClientPostHogProvider } from './PostHogProvider';
export type { PostHogConfig } from './PostHogProvider';
export { PostHogPageView } from './PostHogPageView';

// Re-export useful hooks from posthog-js/react
export { usePostHog } from 'posthog-js/react';
