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
          <div className="prose prose-invert max-w-none space-y-12 text-[var(--text-secondary)]">
            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                1. Our Commitment to Privacy
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  At RYLA, we recognize that privacy is a fundamental human
                  right. This Privacy Policy provides detailed information on
                  how we collect, use, and safeguard your personal information
                  when you use our platform (the “Website” or “Services”).
                </p>
                <p>
                  As a leading AI generation platform, we process data using
                  advanced algorithms. We are committed to maintaining the
                  highest standards of data protection, especially regarding the
                  sensitive nature of AI-generated content and personal persona
                  data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                2. GDPR Compliance & Data Controller
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  If you are a resident of the European Union, you are entitled
                  to the enhanced rights and protection provided by the General
                  Data Protection Regulation (GDPR).
                  <strong>Miracle AI UG (haftungsbeschränkt)</strong>, located
                  at Grolmanstraße 40, 10623 Berlin, Germany, acts as the Data
                  Controller for your personal data.
                </p>
                <p>
                  Our commitment includes providing transparency, ensuring data
                  accuracy, and honoring your rights to erasure, restriction of
                  processing, and data portability.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                3. Information We Collect
              </h2>
              <div className="space-y-6 leading-relaxed">
                <p>We collect information through various methods:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <h3 className="text-white font-semibold mb-2">
                      Directly from You
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <strong>Account Data:</strong> Email, name, and date of
                        birth provided during registration.
                      </li>
                      <li>
                        <strong>Communications:</strong> Any information shared
                        when contacting our support team.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <h3 className="text-white font-semibold mb-2">
                      Automated Collection
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <strong>Log Data:</strong> IP addresses, browser types,
                        and device information.
                      </li>
                      <li>
                        <strong>Interaction Data:</strong> Pages visited,
                        duration of stay, and navigation patterns.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                  <h3 className="text-white font-semibold mb-2">
                    AI Generation Data
                  </h3>
                  <p className="text-sm">
                    This includes the text prompts you enter and any images you
                    upload for "image-to-image" or "persona training" purposes.
                    This data is processed by our AI models to generate the
                    requested output.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                4. AI Processing & Improvement
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  We use advanced artificial intelligence to facilitate user
                  interactions and content creation. All personal data and
                  conversations are processed securely using robust encryption
                  protocols.
                </p>
                <p>
                  <strong>Use of Data for Improvement:</strong> We may use
                  anonymized and aggregated interaction data to refine our AI
                  models. By analyzing prompt patterns collectively, we improve
                  the quality, realism, and safety filters for all users. We
                  ensure that individual users cannot be identified from this
                  improved model training.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                5. Third-Party Services
              </h2>
              <p>
                To provide a seamless experience, we share necessary data with
                trusted service providers:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <strong>Cloud Infrastructure:</strong> AWS and Vercel for
                  hosting.
                </li>
                <li>
                  <strong>AI Services:</strong> Replicate, Hugging Face, and
                  Together AI for model inference.
                </li>
                <li>
                  <strong>Analytics:</strong> PostHog for understanding user
                  behavior.
                </li>
                <li>
                  <strong>Payments:</strong> Finby/Stripe for secure transaction
                  processing.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                6. Data Retention & Security
              </h2>
              <div className="space-y-4 leading-relaxed">
                <p>
                  We retain user data only as long as necessary to fulfill the
                  purposes for which it was collected, or to comply with law.
                  Active accounts' data is stored until the user requests
                  deletion.
                </p>
                <p>
                  We implement industry-standard security measures, including
                  end-to-end encryption for sensitive data, access controls for
                  our engineering team, and regular security audits of our AI
                  pipeline.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 border-b border-white/10 pb-4">
                7. Your Rights
              </h2>
              <p>
                You have the right to access, rectify, or delete your personal
                data at any time. You also have the right to object to
                processing and to data portability.
              </p>
              <p className="mt-4">
                To exercise any of these rights, please contact us at{' '}
                <strong>privacy@ryla.ai</strong>. We will respond to your
                request within 30 days as required by GDPR.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
