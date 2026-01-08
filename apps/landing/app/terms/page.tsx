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
          <div className="prose prose-invert max-w-none space-y-12 text-[var(--text-secondary)]">
            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  Welcome to RYLA. These Terms of Service (“TOS”) set forth the
                  guidelines for using our website located at
                  https://www.ryla.ai/ and our associated application.
                </p>
                <p>
                  Before you access or use RYLA, you must thoroughly review and
                  agree to these TOS. By using the platform, you represent that
                  you have read, understood, and agreed to be bound by these
                  Terms and our Privacy Policy. If you do not agree, you must
                  immediately discontinue use of our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                2. Description of RYLA Services
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  RYLA is a generative artificial intelligence technology
                  platform. We provide users with tools to design, train, and
                  manage hyper-realistic AI Influencers and virtual personas.
                </p>
                <p>Our core services include:</p>
                <ul className="list-disc pl-8 space-y-2">
                  <li>
                    <strong>Persona Training:</strong> Fine-tuning AI models
                    based on user-provided reference images.
                  </li>
                  <li>
                    <strong>Image & Video Generation:</strong> Creating visual
                    content based on text prompts.
                  </li>
                  <li>
                    <strong>Account Management:</strong> Tools for organizing
                    and monetizing AI personas for social media use.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                3. Age Requirement & Eligibility
              </h2>
              <p>
                The Platform is intended for use by individuals who are at least{' '}
                <strong>18 years old</strong>. If you are under 18, you are
                strictly prohibited from accessing our services. We reserve the
                right to request proof of age at any time and may suspend
                accounts suspected of belonging to minors.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                4. Credits, Payments & Earning
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  RYLA operates on a credit-based system. Each generation or
                  training task requires a specific credit balance. Credits can
                  be purchased as one-time packages or through recurring
                  memberships.
                </p>
                <p>
                  <strong>No Refunds:</strong> Due to the immediate allocation
                  of high-cost cloud GPU resources required for AI inference,
                  all credit purchases and subscription fees are final and
                  non-refundable.
                </p>
                <p>
                  <strong>Earning and Monetization:</strong> If you use RYLA as
                  part of an influencer monetization program, you are solely
                  responsible for compliance with tax laws and local advertising
                  regulations regarding the disclosure of AI-generated content.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                5. Intellectual Property & License
              </h2>
              <div className="space-y-6 leading-relaxed">
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    User Submissions
                  </h3>
                  <p>
                    You retain any intellectual property rights you hold in the
                    prompts and reference images you upload. However, you grant
                    RYLA a worldwide, perpetual, royalty-free license to use
                    this content to provide and improve the service.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">
                    Generated Output
                  </h3>
                  <p>
                    Subject to your compliance with these Terms, you are granted
                    a license to use the generated content for your own
                    commercial influencer activities. Please note that
                    AI-generated content without sufficient human creative input
                    may not be copyrightable under certain jurisdictions (e.g.,
                    EU or US law).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                6. Professional Conduct & Restrictions
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>
                  Reverse engineer, scrape, or extract the platform's
                  proprietary weights or algorithms.
                </li>
                <li>
                  Generate deepfakes of real individuals without their
                  verifiable legal consent.
                </li>
                <li>
                  Use automated scripts to generate content in a way that
                  disrupts service for other users.
                </li>
                <li>
                  Deceive audiences by passing off AI-generated humans as real
                  people for malicious purposes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                7. Limitation of Liability
              </h2>
              <p>
                RYLA provides the platform "as is" and "as available." To the
                fullest extent permitted by law, Miracle AI UG
                (haftungsbeschränkt) shall not be liable for any indirect,
                incidental, or consequential damages arising out of your use of
                the AI services.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                8. Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of the Federal Republic of
                Germany. Any disputes arising from these Terms or use of the
                service shall be settled in the competent courts of Berlin,
                Germany.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
