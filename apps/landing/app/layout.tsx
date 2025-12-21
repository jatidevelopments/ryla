import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/components/seo/StructuredData';

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
    default: 'RYLA — AI Influencer Generator | Create AI Girls & Videos',
    template: '%s | RYLA',
  },
  description:
    'Create AI influencers with our AI influencer generator. Generate hyper-realistic AI girls and videos for TikTok, Instagram, and OnlyFans. The #1 AI generator for virtual influencers with perfect character consistency. AI video generator included. Free trial.',
  keywords: [
    // Narrow keywords (high intent)
    'AI influencer',
    'AI influencers',
    'AI influencer generator',
    'create AI influencer',
    'AI OnlyFans',
    'AI girl',
    'AI girls',
    // Broad keywords
    'AI generator',
    'AI video generator',
    // Supporting keywords
    'virtual influencer',
    'AI content generator',
    'hyper-realistic AI',
    'character consistency',
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
    title: 'RYLA — AI Influencer Generator | Create AI Girls & Videos',
    description:
      'Create AI influencers with our AI generator. Generate hyper-realistic AI girls, videos, and content for TikTok, Instagram, and OnlyFans. The best AI video generator for virtual influencers.',
    images: [
      {
        url: '/share-ryla.jpg',
        width: 1200,
        height: 630,
        alt: 'RYLA — AI Influencer Generator | Create AI Girls & Videos',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RYLA — AI Influencer Generator | Create AI Girls & Videos',
    description:
      'Create AI influencers with our AI generator. Generate hyper-realistic AI girls, videos, and content for TikTok, Instagram, and OnlyFans. The best AI video generator for virtual influencers.',
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
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
