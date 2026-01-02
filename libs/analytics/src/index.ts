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

// TikTok React components
export { TikTokProvider } from './TikTokProvider';
export type { TikTokConfig } from './TikTokProvider';
export { TikTokPageView } from './TikTokPageView';

// TikTok tracking functions
export * from './tiktok';
export * from './tiktok-events';

// Facebook React components
export { FacebookProvider } from './FacebookProvider';
export type { FacebookConfig } from './FacebookProvider';

// Facebook tracking functions
export * from './facebook';

// Re-export useful hooks from posthog-js/react
export { usePostHog } from 'posthog-js/react';
