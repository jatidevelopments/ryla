import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${COMPANY.fullName}. How we collect, use, and protect your data.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[var(--nel-bg)] pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-[var(--nel-text)] md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-[var(--nel-text-secondary)]">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="mt-12 space-y-10 text-[var(--nel-text-secondary)]">
            <section>
              <h2 className="text-xl font-semibold text-[var(--nel-text)] border-b border-[var(--nel-border)] pb-2">
                1. Data controller
              </h2>
              <p className="mt-4 leading-relaxed">
                The data controller for this website is <strong>{COMPANY.fullName}</strong>.
                For questions regarding data protection, please contact{' '}
                <strong>{COMPANY.director}</strong> or {COMPANY.email}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--nel-text)] border-b border-[var(--nel-border)] pb-2">
                2. What we collect
              </h2>
              <p className="mt-4 leading-relaxed">
                [Placeholder: Describe what data you collect — e.g. contact form
                data, log data, cookies. Replace with real content after legal
                review.]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--nel-text)] border-b border-[var(--nel-border)] pb-2">
                3. Why we use your data
              </h2>
              <p className="mt-4 leading-relaxed">
                [Placeholder: Purposes and legal basis. Replace with real
                content after legal review.]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--nel-text)] border-b border-[var(--nel-border)] pb-2">
                4. Retention and security
              </h2>
              <p className="mt-4 leading-relaxed">
                [Placeholder: How long you retain data and security measures.
                Replace with real content after legal review.]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--nel-text)] border-b border-[var(--nel-border)] pb-2">
                5. Your rights (GDPR)
              </h2>
              <p className="mt-4 leading-relaxed">
                If you are in the European Economic Area, you have rights to
                access, rectify, erase, restrict processing, data portability,
                and to object. To exercise these rights, contact us at{' '}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-[var(--nel-accent)] hover:text-[var(--nel-accent-hover)]"
                >
                  {COMPANY.email}
                </a>
                . You also have the right to lodge a complaint with a
                supervisory authority.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--nel-text)] border-b border-[var(--nel-border)] pb-2">
                6. Contact
              </h2>
              <p className="mt-4 leading-relaxed">
                {COMPANY.fullName}, {COMPANY.director}. Email:{' '}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-[var(--nel-accent)] hover:text-[var(--nel-accent-hover)]"
                >
                  {COMPANY.email}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
