import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Legal Notice',
  description: `Legal notice and imprint for ${COMPANY.fullName}.`,
  alternates: { canonical: '/imprint' },
};

export default function ImprintPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[var(--nel-bg)] pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-[var(--nel-text)] md:text-4xl">
            Legal Notice (Imprint)
          </h1>
          <p className="mt-2 text-[var(--nel-text-secondary)]">
            Information in accordance with applicable law.
          </p>

          <div className="mt-12 space-y-8 text-[var(--nel-text-secondary)]">
            <section>
              <h2 className="text-lg font-semibold text-[var(--nel-text)]">
                Company
              </h2>
              <p>{COMPANY.fullName}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--nel-text)]">
                Director
              </h2>
              <p>{COMPANY.director}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--nel-text)]">
                Registered address
              </h2>
              <p>[Registered address, Estonia — placeholder. Replace with real data when available.]</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--nel-text)]">
                Commercial register
              </h2>
              <p>[Commercial register number — placeholder.]</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--nel-text)]">
                VAT ID
              </h2>
              <p>[VAT ID — placeholder.]</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--nel-text)]">
                Contact
              </h2>
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-[var(--nel-accent)] hover:text-[var(--nel-accent-hover)]"
              >
                {COMPANY.email}
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
