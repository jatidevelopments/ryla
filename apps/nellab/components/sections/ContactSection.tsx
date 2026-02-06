'use client';

import { COMPANY } from '@/lib/constants';
import { BackgroundBeams, MovingBorder } from '@/components/ui';
import { ContactIllustration } from '@/components/illustrations';

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-28 md:py-36"
    >
      <BackgroundBeams className="opacity-60" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-[var(--nel-border)] bg-[var(--nel-bg)] shadow-xl shadow-black/30 md:aspect-auto md:min-h-[320px]">
            <ContactIllustration className="h-[90%] w-[90%]" />
          </div>
          <div>
            <p className="section-eyebrow mb-3">Get in touch</p>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--nel-text)] md:text-5xl">
              Contact
            </h2>
            <p className="mt-6 text-[19px] text-[var(--nel-text-secondary)]">
              We’d love to hear from you.
            </p>
            <MovingBorder
              as="a"
              href={`mailto:${COMPANY.email}`}
              className="mt-6 inline-flex"
            >
              Email us at {COMPANY.email}
            </MovingBorder>
          </div>
        </div>
      </div>
    </section>
  );
}
