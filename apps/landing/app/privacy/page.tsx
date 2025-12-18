import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'RYLA Privacy Policy - How we collect, use, and protect your data. Learn about our data practices and your privacy rights.',
  keywords: [
    'RYLA privacy policy',
    'data protection',
    'privacy rights',
    'GDPR',
    'data security',
  ],
  openGraph: {
    title: 'Privacy Policy | RYLA',
    description:
      'RYLA Privacy Policy - How we collect, use, and protect your data.',
    url: `${SITE_URL}/privacy`,
    siteName: 'RYLA',
    type: 'website',
    images: [
      {
        url: '/share-ryla.jpg',
        width: 1200,
        height: 630,
        alt: 'RYLA Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | RYLA',
    description:
      'RYLA Privacy Policy - How we collect, use, and protect your data.',
    images: ['/share-ryla.jpg'],
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[var(--text-secondary)]">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8 text-[var(--text-secondary)]">
            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                1. Introduction
              </h2>
              <p>
                Welcome to RYLA ("we," "our," or "us"). We are committed to
                protecting your privacy and ensuring you have a positive
                experience on our platform. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our AI influencer creation platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email, username, password)</li>
                <li>Profile information and preferences</li>
                <li>Content you create, upload, or generate</li>
                <li>Payment and billing information</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                2.2 Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Device information (IP address, browser type, operating
                  system)
                </li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Analytics data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Personalize your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p>
                We do not sell your personal information. We may share your
                information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors
                  who perform services on our behalf
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets
                </li>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly
                  authorize us to share your information
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                5. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information. However, no method of
                transmission over the Internet or electronic storage is 100%
                secure. While we strive to use commercially acceptable means to
                protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                6. Your Rights and Choices
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p>
                We use cookies and similar tracking technologies to track
                activity on our platform and hold certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent. However, if you do not accept cookies,
                you may not be able to use some portions of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                8. Children's Privacy
              </h2>
              <p>
                Our service is not intended for individuals under the age of 18.
                We do not knowingly collect personal information from children.
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                9. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                10. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@ryla.ai
                <br />
                <strong>Website:</strong>{' '}
                <a
                  href="/"
                  className="text-[var(--purple-400)] hover:underline"
                >
                  ryla.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
