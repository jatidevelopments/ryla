'use client';

import { ReactNode, Suspense } from 'react';
import {
  ClientPostHogProvider,
  PostHogPageView,
  TikTokProvider,
  TikTokPageView,
  FacebookProvider,
} from '@ryla/analytics';
import { FbPixelDebug } from './FbPixelDebug';

interface Props {
  children: ReactNode;
}

export function AnalyticsProviders({ children }: Props) {
  return (
    <ClientPostHogProvider>
      <TikTokProvider>
        <FacebookProvider>
          <FbPixelDebug />
          <Suspense fallback={null}>
            <PostHogPageView />
            <TikTokPageView />
          </Suspense>
          {children}
        </FacebookProvider>
      </TikTokProvider>
    </ClientPostHogProvider>
  );
}
