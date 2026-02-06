import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of service for ${COMPANY.fullName}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[var(--nel-bg)] pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-[var(--nel-text)] md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-[var(--nel-text-secondary)]">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <div className="mt-12 space-y-6 text-[var(--nel-text-secondary)]">
            <p className="leading-relaxed">
              [Placeholder: Terms of service content. Replace with real terms
              after legal review.]
            </p>
            <p className="leading-relaxed">
              For questions, contact {COMPANY.fullName} at{' '}
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-[var(--nel-accent)] hover:text-[var(--nel-accent-hover)]"
              >
                {COMPANY.email}
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
