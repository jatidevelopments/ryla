'use client';

import { ReactNode, Suspense } from 'react';
import {
  ClientPostHogProvider,
  PostHogPageView,
  TikTokProvider,
  TikTokPageView,
  TwitterProvider,
  TwitterPageView,
  FacebookProvider,
  FacebookPageView,
} from '@ryla/analytics';

interface Props {
  children: ReactNode;
}

/**
 * Analytics Providers for Landing Page
 * 
 * Provides social media pixel tracking (Facebook, TikTok, Twitter/X) and PostHog analytics.
 * All providers follow best practices:
 * - Use Next.js Script component for optimal loading
 * - Environment-aware (disabled in dev by default)
 * - Automatic pageview tracking on route changes
 * 
 * Pageview tracking:
 * - Facebook: Automatic on init + route changes (via FacebookPageView)
 * - TikTok: Automatic on init + route changes (via TikTokPageView)
 * - Twitter/X: Automatic on config + route changes (via TwitterPageView)
 * - PostHog: Route changes (via PostHogPageView)
 */
export function AnalyticsProviders({ children }: Props) {
  return (
    <ClientPostHogProvider>
      <TikTokProvider>
        <TwitterProvider>
          <FacebookProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
              <FacebookPageView />
              <TikTokPageView />
              <TwitterPageView />
            </Suspense>
            {children}
          </FacebookProvider>
        </TwitterProvider>
      </TikTokProvider>
    </ClientPostHogProvider>
  );
}
