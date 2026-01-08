import { Navigation, Footer } from '@/components/sections';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

export const metadata: Metadata = {
  title: 'Imprint (Impressum)',
  description: 'RYLA Imprint - Legal information about the service provider.',
  alternates: {
    canonical: '/imprint',
  },
};

export default function ImprintPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Imprint (Impressum)
            </h1>
            <p className="text-[var(--text-secondary)]">
              Information according to § 5 DDG
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white/5 p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors text-[var(--text-secondary)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                  Service Provider
                </h2>
                <div className="space-y-1 text-lg">
                  <p className="font-bold text-white">
                    Miracle AI UG (haftungsbeschränkt)
                  </p>
                  <p className="text-white/70">Grolmanstraße 40</p>
                  <p className="text-white/70">10623 Berlin</p>
                  <p className="text-white/70">Germany</p>
                </div>
              </section>

              <section className="bg-white/5 p-8 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors text-[var(--text-secondary)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                  Contact
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Email</p>
                    <a
                      href="mailto:info@ryla.ai"
                      className="text-lg text-white hover:text-[var(--purple-400)] transition-colors"
                    >
                      info@ryla.ai
                    </a>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white/5 p-8 rounded-2xl border border-white/5 shadow-xl group hover:border-white/10 transition-colors text-[var(--text-secondary)]">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                  Registration
                </h2>
                <div className="space-y-3">
                  <p className="text-white/70">
                    <strong className="text-white block text-sm mb-1">
                      Register Court
                    </strong>
                    Amtsgericht Charlottenburg (Berlin)
                  </p>
                  <p className="text-white/70">
                    <strong className="text-white block text-sm mb-1">
                      Register Number
                    </strong>
                    HRB 231497 B
                  </p>
                  <p className="text-white/70">
                    <strong className="text-white block text-sm mb-1">
                      VAT Identification
                    </strong>
                    DE346705159
                  </p>
                </div>
              </section>

              <section className="bg-white/5 p-8 rounded-2xl border border-white/5 shadow-xl group hover:border-white/10 transition-colors text-[var(--text-secondary)]">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                  Representatives
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">
                      Managing Directors
                    </p>
                    <p className="text-lg text-white">
                      Jonas Frederik Paul Gaebel
                    </p>
                    <p className="text-lg text-white">Makszim Rimarcsuk</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-white/40 mb-1">
                      Responsible for content (§ 18 MStV)
                    </p>
                    <p className="text-sm text-white/70">
                      Jonas Frederik Paul Gaebel
                    </p>
                    <p className="text-sm text-white/70">
                      Grolmanstraße 40, 10623 Berlin
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="prose prose-invert max-w-none pt-12 border-t border-white/5 space-y-12 text-[var(--text-secondary)]">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  EU Dispute Resolution
                </h2>
                <p className="text-white/60 leading-relaxed">
                  The European Commission provides a platform for online dispute
                  resolution (ODR):{' '}
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--purple-400)] hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                  . Our e-mail address can be found above in the imprint.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Consumer Dispute Resolution
                </h2>
                <p className="text-white/60 leading-relaxed">
                  We are not willing or obliged to participate in dispute
                  resolution proceedings before a consumer arbitration board.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
