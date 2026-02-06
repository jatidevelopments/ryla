import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Modal Playground · RYLA',
  description: 'Test and compare Modal.com AI endpoints',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.className} min-h-screen antialiased`}
        style={{ background: 'var(--bg-base)', color: 'var(--foreground)' }}
      >
        {children}
      </body>
    </html>
  );
}
