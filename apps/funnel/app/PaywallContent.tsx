'use client';

import { Suspense } from 'react';
import FunnelView from '@/features/funnel';
import { EntryPageMetaTags } from '@/components/SEO/EntryPageMetaTags';
import { EntryPageStructuredData } from '@/components/SEO/EntryPageStructuredData';

function FunnelViewFallback() {
  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function PaywallContent() {
  return (
    <>
      {/* SEO Meta Tags for search engines and AI crawlers */}
      <EntryPageMetaTags />
      {/* Structured Data (JSON-LD) for ChatGPT and search engines */}
      <EntryPageStructuredData />

      <section className="w-full flex-1 overflow-y-auto relative flex justify-center">
        <Suspense fallback={<FunnelViewFallback />}>
          <FunnelView />
        </Suspense>
      </section>
    </>
  );
}
