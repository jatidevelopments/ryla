import type { Metadata, Viewport } from 'next';
import { COMPANY } from '@/lib/constants';
import './globals.css';

const SITE_URL = COMPANY.domain;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Neural Evolution Labs — AI Software Lab',
    template: '%s | Neural Evolution Labs',
  },
  description:
    'We build and scale AI products and SaaS. Neural Evolution Labs is an AI software lab creating cutting-edge AI solutions for consumer and enterprise markets.',
  keywords: [
    'AI software lab',
    'AI products',
    'SaaS',
    'Neural Evolution Labs',
    'NEL',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Neural Evolution Labs',
    title: 'Neural Evolution Labs — AI Software Lab',
    description:
      'We build and scale AI products and SaaS. Neural Evolution Labs is an AI software lab creating cutting-edge AI solutions for consumer and enterprise markets.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neural Evolution Labs — AI Software Lab',
    description:
      'We build and scale AI products and SaaS. Neural Evolution Labs is an AI software lab creating cutting-edge AI solutions for consumer and enterprise markets.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased text-[var(--nel-text)] bg-[var(--nel-bg)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[var(--nel-accent)] focus:px-4 focus:py-2 focus:text-black focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
