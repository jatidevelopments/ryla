import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';

import Providers from '@/components/Providers';
import MainContentWrapper from '@/components/layouts/MainContentWrapper';

import './globals.css';
import './app.css';
import { SPRITE_URL } from '@/constants/sprite';
import { ClientPosthogProvider } from './posthog-provider';
import { Suspense } from 'react';
import PostHogPageView from '@/components/PostHogPageView';
import { withCdn } from '@/lib/cdn';
import { CdnDebug } from '@/components/CdnDebug';
import { FbPixelDebug } from '@/components/FbPixelDebug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://goviral.ryla.ai';
const HERO_VIDEO_PATH = '/video/ai_influencer_video_1.mp4';
const HERO_VIDEO_URL = withCdn(HERO_VIDEO_PATH);
const OG_IMAGE_URL = withCdn('/share-ryla.jpg');

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Ryla.ai — Create Hyper-Realistic AI Influencers That Earn 24/7',
    template: '%s | Ryla.ai',
  },
  description:
    'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, and OnlyFans. Build your AI influencer empire with one click.',
  keywords: [
    'AI influencer',
    'AI creator',
    'virtual influencer',
    'AI content generator',
    'hyper-realistic AI',
    'character consistency',
    'AI video generation',
    'NSFW AI content',
    'Fanvue AI',
    'OnlyFans AI',
    'TikTok AI',
    'Instagram AI',
    'passive income',
    'AI monetization',
  ],
  authors: [{ name: 'Ryla.ai' }],
  creator: 'Ryla.ai',
  publisher: 'Ryla.ai',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Ryla.ai',
    title: 'Ryla.ai — Create Hyper-Realistic AI Influencers That Earn 24/7',
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, and OnlyFans. Build your AI influencer empire with one click.',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Ryla.ai — Create Hyper-Realistic AI Influencers That Earn 24/7',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ryla.ai — Create Hyper-Realistic AI Influencers That Earn 24/7',
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, and OnlyFans. Build your AI influencer empire with one click.',
    images: [OG_IMAGE_URL],
    creator: '@RylaAI',
    site: '@RylaAI',
  },
  icons: {
    icon: [
      {
        url: withCdn('/favicon/favicon-16x16.png'),
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: withCdn('/favicon/favicon-32x32.png'),
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: withCdn('/favicon/apple-touch-icon.png'),
    other: [{ rel: 'icon', url: withCdn('/favicon/favicon.ico') }],
  },
  manifest: withCdn('/favicon/site.webmanifest'),
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href={withCdn(SPRITE_URL)} />

        {/* Favicon Links */}
        <link
          rel="icon"
          type="image/x-icon"
          href={withCdn('/favicon/favicon.ico')}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={withCdn('/favicon/favicon-16x16.png')}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={withCdn('/favicon/favicon-32x32.png')}
        />
        <link
          rel="apple-touch-icon"
          href={withCdn('/favicon/apple-touch-icon.png')}
        />
        <link rel="manifest" href={withCdn('/favicon/site.webmanifest')} />

        {/* Cookie Banner Script */}
        <Script
          src="https://cdn.cookie-script.com/s/fe54df73a5f0d02ae09c4da983f9b9a5.js"
          type="text/javascript"
          charSet="UTF-8"
          strategy="beforeInteractive"
        />

        {/* Google Tag Manager */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16515055993"
          strategy="afterInteractive"
        />
        <Script id="google-gtag" strategy="afterInteractive">
          {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'AW-16515055993');
                    `}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className={`${jakartaSans.className} antialiased`}
      >
        <Providers>
          <ClientPosthogProvider>
            <CdnDebug />
            <FbPixelDebug />
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>

            <div className="min-h-dvh w-full flex flex-col">
              <MainContentWrapper>{children}</MainContentWrapper>
            </div>

            <Toaster richColors position="bottom-right" />
          </ClientPosthogProvider>
        </Providers>

        {/* finby Payment Scripts */}
        {/* jQuery is required by finby popup.js */}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />
        {/* finby popup.js for payment gateway */}
        <Script
          src="https://mapi.finby.eu/mapi5/Scripts/finby/popup.js"
          strategy="beforeInteractive"
        />

        {/* Facebook Pixel Script - High-level initialization */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
                        (function() {
                            // GUARD 1: Prevent entire script from executing twice
                            if (window.__fbPixelsScriptExecuted) {
                                return;
                            }
                            window.__fbPixelsScriptExecuted = true;
                            
                            // Load Facebook Pixel script
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            
                            // Initialize pixel after script loads
                            (function() {
                                // GUARD 2: Prevent init from running twice
                                if (window.__fbPixelsInitStarted) {
                                    return;
                                }
                                window.__fbPixelsInitStarted = true;
                                
                                var pixelId = '2633023407061165';
                                
                                // GUARD 3: Validate pixel ID is numeric
                                if (!/^[0-9]+$/.test(pixelId)) {
                                    console.error('[FB Pixel] Invalid pixel ID:', pixelId);
                                    return;
                                }
                                
                                function initPixel() {
                                    if (typeof window.fbq !== 'function') {
                                        setTimeout(initPixel, 50);
                                        return;
                                    }
                                    
                                    // GUARD 4: Prevent fbq('init') from being called again
                                    if (window.__fbPixelInitialized) {
                                        return;
                                    }
                                    
                                    window.fbq('init', pixelId);
                                    window.__fbPixelInitialized = true;
                                    
                                    // GUARD 5: Prevent PageView from being tracked multiple times
                                    if (!window.__fbPageViewTracked) {
                                        window.fbq('track', 'PageView');
                                        window.__fbPageViewTracked = true;
                                    }
                                }
                                
                                // Start initialization
                                initPixel();
                            })();
                        })();
                    `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2633023407061165&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </html>
  );
}
