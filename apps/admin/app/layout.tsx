import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AdminTRPCProvider } from '@/lib/trpc/client';
import { AdminAuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

// DM Sans - Clean, modern, geometric sans-serif (unified with web app)
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// JetBrains Mono for code/stats
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'RYLA Admin',
    template: '%s | RYLA Admin',
  },
  description: 'RYLA Admin Back-Office Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${jetBrainsMono.variable} font-sans bg-background text-white min-h-screen antialiased`}
      >
        <AdminTRPCProvider>
          <AdminAuthProvider>
            {children}
            <Toaster />
          </AdminAuthProvider>
        </AdminTRPCProvider>
      </body>
    </html>
  );
}
// Deployment test - Wed Jan 21 16:22:35 CET 2026
// Deployment trigger - Thu Jan 22 13:53:44 CET 2026
