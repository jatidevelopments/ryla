import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'RYLA Terms of Service - Terms and conditions for using our platform. Read our user agreement and service terms.',
  keywords: [
    'RYLA terms of service',
    'terms and conditions',
    'user agreement',
    'service terms',
  ],
  openGraph: {
    title: 'Terms of Service | RYLA',
    description:
      'RYLA Terms of Service - Terms and conditions for using our platform.',
    url: `${SITE_URL}/terms`,
    siteName: 'RYLA',
    type: 'website',
    images: [
      {
        url: '/share-ryla.jpg',
        width: 1200,
        height: 630,
        alt: 'RYLA Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | RYLA',
    description:
      'RYLA Terms of Service - Terms and conditions for using our platform.',
    images: ['/share-ryla.jpg'],
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Terms of Service
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
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using RYLA ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you disagree with
                any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                2. Description of Service
              </h2>
              <p>
                RYLA is an AI-powered platform that enables users to create,
                manage, and monetize AI influencers. The Service includes tools
                for generating images, videos, and content, as well as features
                for managing social media presence and monetization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                3. User Accounts
              </h2>
              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                3.1 Account Creation
              </h3>
              <p>
                To use certain features of the Service, you must register for an
                account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>
                  Maintain and update your information to keep it accurate
                </li>
                <li>Maintain the security of your password</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
              </ul>

              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                3.2 Age Requirement
              </h3>
              <p>
                You must be at least 18 years old to use the Service. By using
                the Service, you represent and warrant that you are at least 18
                years of age.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                4. Acceptable Use
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Use the Service for any illegal purpose or in violation of any
                  laws
                </li>
                <li>
                  Create, upload, or share content that is harmful, abusive, or
                  violates others' rights
                </li>
                <li>
                  Impersonate any person or entity or misrepresent your
                  affiliation
                </li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>
                  Attempt to gain unauthorized access to any portion of the
                  Service
                </li>
                <li>
                  Use automated systems to access the Service without permission
                </li>
                <li>
                  Reverse engineer, decompile, or disassemble any part of the
                  Service
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                5. Content and Intellectual Property
              </h2>
              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                5.1 Your Content
              </h3>
              <p>
                You retain ownership of content you create, upload, or generate
                using the Service. By using the Service, you grant us a license
                to use, store, and process your content as necessary to provide
                the Service.
              </p>

              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                5.2 Our Content
              </h3>
              <p>
                The Service, including its original content, features, and
                functionality, is owned by RYLA and is protected by
                international copyright, trademark, and other intellectual
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                6. Payments and Billing
              </h2>
              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                6.1 Subscription Plans
              </h3>
              <p>
                The Service offers various subscription plans. By subscribing,
                you agree to pay the fees specified for your chosen plan. Fees
                are charged in advance on a recurring basis.
              </p>

              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                6.2 Refunds
              </h3>
              <p>
                Refund policies vary by plan and are subject to our refund
                policy. Contact support for refund requests.
              </p>

              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 mt-6">
                6.3 Price Changes
              </h3>
              <p>
                We reserve the right to modify subscription fees. We will
                provide notice of any price changes, and you may cancel your
                subscription before the changes take effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                7. Termination
              </h2>
              <p>
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice, for conduct that we
                believe violates these Terms or is harmful to other users, us,
                or third parties, or for any other reason.
              </p>
              <p className="mt-4">
                You may terminate your account at any time by contacting support
                or using account deletion features in your settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                8. Disclaimers
              </h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM
                ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                9. Limitation of Liability
              </h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RYLA SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
                GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                10. Indemnification
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless RYLA and its
                officers, directors, employees, and agents from and against any
                claims, liabilities, damages, losses, and expenses, including
                reasonable attorneys' fees, arising out of or in any way
                connected with your use of the Service or violation of these
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                11. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of [Your Jurisdiction], without regard to its
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                12. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify users of any material changes by posting the new Terms on
                this page and updating the "Last updated" date. Your continued
                use of the Service after such changes constitutes acceptance of
                the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                13. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@ryla.ai
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
