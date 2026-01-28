'use client';

import { GradientBackground } from '@/components/ryla-ui';
import { FadeInUp } from '@/components/animations';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';

/**
 * FinalCTASection Component (V4 Minimal)
 *
 * Shows waitlist form for early access signups.
 */
export function FinalCTASection() {
  return (
    <section
      id="waitlist"
      className="relative py-24 md:py-32 overflow-hidden bg-transparent"
    >
      {/* Gradient background */}
      <GradientBackground position="center" intensity="strong" />

      {/* Secondary glow */}
      <div
        className="absolute bottom-0 left-1/4 w-[500px] h-[400px] pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(ellipse, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
              Your <span className="text-gradient">AI influencer</span> is
              waiting.
            </h2>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Join the waitlist to be among the first to create your AI
              influencer.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={100}>
          <WaitlistForm />
        </FadeInUp>
      </div>
    </section>
  );
}

export default FinalCTASection;
