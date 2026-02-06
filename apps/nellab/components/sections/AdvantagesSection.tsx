'use client';

import { DottedGlowBackground, LampContainer, MovingBorder } from '@/components/ui';

export function AdvantagesSection() {
  return (
    <section id="advantages" className="relative overflow-hidden px-6 py-28 md:py-36">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 0%, transparent 70%)',
        }}
      >
        <DottedGlowBackground
          className="size-full"
          opacity={1}
          gap={10}
          radius={1.6}
          color="rgba(255,255,255,0.2)"
          glowColor="rgba(6,182,212,0.5)"
          backgroundOpacity={0}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
      </div>
      <div className="relative z-10">
        <LampContainer className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="section-eyebrow mb-3">Why NEL</p>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--nel-text)] md:text-5xl">
              Build the future of AI with us
            </h2>
            <p className="mt-8 text-[19px] leading-[1.6] text-[var(--nel-text-secondary)]">
              Global reach. Remote-first. We drive growth and redefine what’s
              possible.
            </p>
            <div className="mt-12">
              <MovingBorder as="a" href="#contact">
                Get in touch
              </MovingBorder>
            </div>
          </div>
        </LampContainer>
      </div>
    </section>
  );
}
