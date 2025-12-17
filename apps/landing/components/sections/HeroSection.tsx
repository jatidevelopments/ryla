'use client';

import { RylaButton } from '@/components/ryla-ui';
import { Container, GradientBackground } from '@/components/ryla-ui';
import { FadeInUp } from '@/components/animations';
import { LogoMarquee, PlatformLogo } from '@/components/animations';
import { VelocityScroll } from '@/components/ui/scroll-velocity';
import { ShinyButton } from '@/components/ui/shiny-button';
import { HeroBackground } from './HeroBackground';
import { ArrowRight } from 'lucide-react';
import { FUNNEL_URL } from '@/lib/constants';

/**
 * HeroSection Component (V4 Minimal Copy)
 * 
 * Mobbin-inspired minimal hero with maximum impact.
 * Features scrolling social post cards as background.
 */
export function HeroSection() {
  return (
    <section
      className="relative min-h-[85vh] flex flex-col justify-center pt-20 pb-20 overflow-hidden bg-black"
      style={{ zIndex: 20 }}
    >
      {/* Solid black background to completely block background image */}
      <div className="absolute inset-0 bg-black z-0" aria-hidden="true" />

      {/* Scrolling social post cards background */}
      <HeroBackground />
      
      {/* Gradient glow overlay */}
      <GradientBackground position="top" intensity="medium" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <FadeInUp delay={0}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] leading-tight mb-4">
              Create <span className="text-gradient">AI influencers</span> that
              earn 24/7.
            </h1>
          </FadeInUp>

          {/* Subheadline */}
          <FadeInUp delay={100}>
            <p className="text-lg md:text-xl lg:text-2xl text-[var(--text-secondary)] max-w-xl mx-auto mb-6">
              Hyper-realistic. Consistent. Ready to generate revenue at scale.
            </p>
          </FadeInUp>

          {/* CTAs */}
          <FadeInUp delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <ShinyButton href={FUNNEL_URL}>Start Creating</ShinyButton>
              <a href="#how-it-works">
                <RylaButton variant="secondary" size="lg">
                  See How It Works
                  <ArrowRight className="w-4 h-4 ml-1" />
                </RylaButton>
              </a>
            </div>
          </FadeInUp>

          {/* Platform logos */}
          <FadeInUp delay={300}>
            <LogoMarquee
              speed="slow"
              fadeEdges={false}
              className="max-w-md mx-auto"
            >
              <PlatformLogo name="tiktok" size="sm" />
              <PlatformLogo name="instagram" size="sm" />
              <PlatformLogo name="twitter" size="sm" />
              <PlatformLogo name="reddit" size="sm" />
            </LogoMarquee>
          </FadeInUp>
        </div>
      </Container>

      {/* Velocity scroll - bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <VelocityScroll defaultVelocity={1.5} className="py-4">
          <span className="text-sm md:text-base lg:text-lg font-medium text-white/25 mx-6">
            Hyper-realistic
            <span className="text-purple-500/60 mx-3">•</span>
          </span>
          <span className="text-sm md:text-base lg:text-lg font-medium text-white/25 mx-6">
            Consistent
            <span className="text-purple-500/60 mx-3">•</span>
          </span>
          <span className="text-sm md:text-base lg:text-lg font-medium text-white/25 mx-6">
            Ready to monetize
            <span className="text-purple-500/60 mx-3">•</span>
          </span>
          <span className="text-sm md:text-base lg:text-lg font-medium text-white/25 mx-6">
            TikTok
            <span className="text-purple-500/60 mx-3">•</span>
          </span>
          <span className="text-sm md:text-base lg:text-lg font-medium text-white/25 mx-6">
            Instagram
            <span className="text-purple-500/60 mx-3">•</span>
          </span>
        </VelocityScroll>
      </div>
    </section>
  );
}

export default HeroSection;
