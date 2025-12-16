"use client";

import FunnelView from "@/features/funnel";
import { EntryPageMetaTags } from "@/components/SEO/EntryPageMetaTags";
import { EntryPageStructuredData } from "@/components/SEO/EntryPageStructuredData";

// Disable static generation and prerendering for this page
export const dynamic = 'force-dynamic';

export default function PaywallPage() {
    console.log("PaywallPage1");
    return (
        <>
            {/* SEO Meta Tags for search engines and AI crawlers */}
            <EntryPageMetaTags />
            {/* Structured Data (JSON-LD) for ChatGPT and search engines */}
            <EntryPageStructuredData />
            
            <section className="w-full flex-1 overflow-y-auto relative flex justify-center">
                <FunnelView />
            </section>
        </>
    );
}
