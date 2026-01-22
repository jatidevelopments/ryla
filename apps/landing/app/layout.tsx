// Test deployment trigger - 2025-01-11 (final test)
import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/components/seo/StructuredData';
import { AnalyticsProviders } from '@/components/AnalyticsProviders';

// DM Sans - Clean, modern, geometric sans-serif
// https://fonts.google.com/specimen/DM+Sans
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// JetBrains Mono for code/stats
const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ryla.ai';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RYLA — Create Hyper-Realistic AI Influencers That Earn 24/7',
    template: '%s | RYLA',
  },
  description:
    'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click. Starting at $29/month. Free trial available.',
  keywords: [
    'AI influencer',
    'AI creator',
    'virtual influencer',
    'AI content generator',
    'hyper-realistic AI',
    'character consistency',
    'AI video generation',
    'TikTok AI',
    'Instagram AI',
    'passive income',
    'AI monetization',
    'lipsync AI',
    'AI image generator',
  ],
  authors: [{ name: 'RYLA' }],
  creator: 'RYLA',
  publisher: 'RYLA',
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
    // AI crawlers are allowed via robots.txt
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'RYLA',
    title: 'RYLA — Create Hyper-Realistic AI Influencers That Earn 24/7',
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click.',
    images: [
      {
        url: '/share-ryla.jpg',
        width: 1200,
        height: 630,
        alt: 'RYLA — Create Hyper-Realistic AI Influencers That Earn 24/7',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RYLA — Create Hyper-Realistic AI Influencers That Earn 24/7',
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click.',
    images: ['/share-ryla.jpg'],
    creator: '@RylaAI',
    site: '@RylaAI',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    shortcut: '/favicon/favicon.ico',
  },
  manifest: '/favicon/site.webmanifest',
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${jetBrainsMono.variable} font-sans antialiased dark`}
      >
        <AnalyticsProviders>
          <StructuredData />
          {children}
        </AnalyticsProviders>
      </body>
    </html>
  );
}
// Deployment test - Wed Jan 21 16:22:35 CET 2026
// Deployment trigger - Thu Jan 22 13:53:44 CET 2026
