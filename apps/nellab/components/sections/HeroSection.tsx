'use client';

import { Spotlight, TypewriterEffect, DottedGlowBackground } from '@/components/ui';
import { HeroIllustration } from '@/components/illustrations';

const HERO_WORDS = [
  { text: 'AI products.', className: 'text-[var(--nel-accent)]' },
  { text: 'SaaS.', className: 'text-[var(--nel-accent)]' },
  { text: 'scale.', className: 'text-[var(--nel-accent)]' },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] flex-col justify-center px-6 pt-24 pb-20"
    >
      <DottedGlowBackground
        gap={14}
        radius={1.5}
        color="rgba(255,255,255,0.25)"
        glowColor="rgba(6, 182, 212, 0.5)"
        opacity={0.4}
        speedMin={0.3}
        speedMax={1}
        className="opacity-100"
      />
      <Spotlight fill="#06b6d4" className="opacity-60" />

      <div className="relative mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <div className="text-center md:text-left">
          <p className="section-eyebrow mb-4">AI Software Lab</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--nel-text)] sm:text-5xl md:text-6xl md:leading-[1.1]">
            Building and scaling{' '}
            <span className="inline-block min-h-[1.2em] align-bottom">
              <TypewriterEffect
                words={HERO_WORDS}
                cursorClassName="bg-[var(--nel-accent)]"
              />
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--nel-text-secondary)] md:text-xl md:leading-relaxed">
            We create cutting-edge AI solutions for consumer and enterprise
            markets.
          </p>
          <a
            href="#contact"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-[var(--nel-accent)] bg-[var(--nel-accent)]/10 px-5 py-2.5 text-[17px] font-medium text-[var(--nel-accent)] transition-colors hover:bg-[var(--nel-accent)]/20 hover:text-[var(--nel-accent-hover)]"
          >
            Get in touch
            <span aria-hidden>→</span>
          </a>
        </div>

        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-[var(--nel-border)] bg-[var(--nel-bg)] shadow-2xl shadow-black/40">
          <HeroIllustration className="h-[85%] w-[85%]" />
        </div>
      </div>
      <a
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[var(--nel-text-tertiary)] hover:text-[var(--nel-text-secondary)] transition-colors sm:bottom-8"
        aria-label="Scroll to content"
      >
        <span className="text-[11px] font-medium uppercase tracking-widest sm:text-xs">Scroll</span>
        <span className="block h-6 w-px bg-current opacity-50 sm:h-8" />
      </a>
    </section>
  );
}
