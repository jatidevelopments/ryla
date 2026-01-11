// Test deployment trigger - 2025-01-11
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';

import Providers from '@/components/Providers';
import MainContentWrapper from '@/components/layouts/MainContentWrapper';

import './globals.css';
import './app.css';
import { withCdn } from '@/lib/cdn';
import { SPRITE_URL } from '@/constants/sprite';
import { CdnDebug } from '@/components/CdnDebug';
import { AnalyticsProviders } from '@/components/AnalyticsProviders';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://goviral.ryla.ai';
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
          <AnalyticsProviders>
            <CdnDebug />

            <div className="min-h-dvh w-full flex flex-col">
              <MainContentWrapper>{children}</MainContentWrapper>
            </div>

            <Toaster richColors position="bottom-right" />
          </AnalyticsProviders>
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

        {/* Facebook Pixel is now loaded via FacebookProvider component */}
      </body>
    </html>
  );
}
