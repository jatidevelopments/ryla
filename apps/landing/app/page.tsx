import Image from 'next/image';
import {
  Navigation,
  HeroSection,
  StatsSection,
  FeatureShowcase,
  HowItWorksSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  FinalCTASection,
  Footer,
} from '@/components/sections';

/**
 * RYLA Landing Page (V4 Minimal Copy)
 *
 * Mobbin-inspired design with minimal copy (~400 words total).
 * Purple gradient accents, subtle scroll animations, clean layout.
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />
      <HeroSection />

      {/* Container with background image for sections from Stats to FAQ */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.jpg"
            alt="Background"
            fill
            className="object-cover opacity-50"
            priority={false}
          />
        </div>

        {/* Black overlay with 70% opacity */}
        <div className="absolute inset-0 z-0 bg-black/70" />

        {/* Sections with background */}
        <div className="relative z-10">
          <StatsSection />
          <FeatureShowcase />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
          <FinalCTASection />
          <FAQSection />
        </div>
      </div>

      <Footer />
    </main>
  );
}
