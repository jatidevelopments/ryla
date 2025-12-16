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

      {/* Stats Section - no background */}
      <StatsSection />

      {/* Features Section with background.jpg */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.jpg"
            alt="Background"
            fill
            className="object-cover opacity-40"
            priority={false}
          />
        </div>
        {/* Black overlay */}
        <div className="absolute inset-0 z-0 bg-black/60" />
        {/* Top fade gradient - black fading in */}
        <div className="absolute inset-x-0 top-0 h-32 z-[1] bg-gradient-to-b from-[var(--bg-primary)] to-transparent" />
        {/* Bottom fade gradient - black fading out */}
        <div className="absolute inset-x-0 bottom-0 h-32 z-[1] bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        {/* Content */}
        <div className="relative z-10">
          <FeatureShowcase />
        </div>
      </div>

      {/* How It Works - no background */}
      <HowItWorksSection />

      {/* Testimonials - no background */}
      <TestimonialsSection />

      {/* Pricing Section with background2.png */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background2.png"
            alt="Background"
            fill
            className="object-cover opacity-40"
            priority={false}
          />
        </div>
        {/* Black overlay */}
        <div className="absolute inset-0 z-0 bg-black/60" />
        {/* Top fade gradient - black fading in */}
        <div className="absolute inset-x-0 top-0 h-32 z-[1] bg-gradient-to-b from-[var(--bg-primary)] to-transparent" />
        {/* Bottom fade gradient - black fading out */}
        <div className="absolute inset-x-0 bottom-0 h-32 z-[1] bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        {/* Content */}
        <div className="relative z-10">
          <PricingSection />
        </div>
      </div>

      {/* Final CTA - no background */}
      <FinalCTASection />

      {/* FAQ - no background */}
      <FAQSection />

      <Footer />
    </main>
  );
}
