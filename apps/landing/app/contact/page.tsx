import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';
import { Mail, MessageSquare } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    "Get in touch with RYLA - We're here to help you create amazing AI influencers. Contact our support team via email.",
  keywords: [
    'contact RYLA',
    'RYLA support',
    'AI influencer support',
    'customer service',
  ],
  openGraph: {
    title: 'Contact Us | RYLA',
    description:
      "Get in touch with RYLA - We're here to help you create amazing AI influencers.",
    url: `${SITE_URL}/contact`,
    siteName: 'RYLA',
    type: 'website',
    images: [
      {
        url: '/share-ryla.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact RYLA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | RYLA',
    description:
      "Get in touch with RYLA - We're here to help you create amazing AI influencers.",
    images: ['/share-ryla.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />

      {/* Background - same as landing page */}
      <div className="relative">
        {/* Background Image */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            opacity: 0.4,
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            contain: 'layout style paint',
          }}
          aria-hidden="true"
        />
        {/* Black overlay */}
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-black/60"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />

        {/* Content */}
        <div className="relative z-10 pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-4">
                Get in <span className="text-gradient">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                Have questions? We&apos;re here to help. Reach out and
                we&apos;ll get back to you as soon as possible.
              </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Email */}
              <a
                href="mailto:support@ryla.ai"
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Email Us
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-2">
                      Send us an email and we&apos;ll respond within 24 hours.
                    </p>
                    <p className="text-purple-400 font-medium">
                      support@ryla.ai
                    </p>
                  </div>
                </div>
              </a>

              {/* Support */}
              <a
                href="mailto:support@ryla.ai?subject=Support Request"
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                    <MessageSquare className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Support
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-2">
                      Need help? Our support team is ready to assist.
                    </p>
                    <p className="text-pink-400 font-medium">Get Support</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Additional Info */}
            <div className="mt-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Response Time
              </h2>
              <p className="text-[var(--text-secondary)]">
                We typically respond to all inquiries within 24 hours during
                business days. For urgent matters, please mention "URGENT" in
                your subject line.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
