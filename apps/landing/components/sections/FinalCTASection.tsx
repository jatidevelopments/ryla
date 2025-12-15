"use client";

import { GradientBackground } from "@/components/ryla-ui";
import { FadeInUp } from "@/components/animations";
import { ShinyButton } from "@/components/ui/shiny-button";

/**
 * FinalCTASection Component (V4 Minimal)
 * 
 * Short headline, one subheadline, one CTA.
 */
export function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[var(--bg-primary)]">
      {/* Gradient background */}
      <GradientBackground position="center" intensity="strong" />
      
      {/* Secondary glow */}
      <div
        className="absolute bottom-0 left-1/4 w-[500px] h-[400px] pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
            Your <span className="text-gradient">AI influencer</span> is waiting.
          </h2>
        </FadeInUp>

        <FadeInUp delay={100}>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Join thousands earning passive income.
          </p>
        </FadeInUp>

        <FadeInUp delay={200}>
          <ShinyButton className="text-lg px-10 py-4">
            Start Creating Now
          </ShinyButton>
        </FadeInUp>
      </div>
    </section>
  );
}

export default FinalCTASection;

