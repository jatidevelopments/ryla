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
} from "@/components/sections";

/**
 * RYLA Landing Page V2 (V4 Minimal Copy)
 * 
 * Mobbin-inspired design with minimal copy (~400 words total).
 * Purple gradient accents, subtle scroll animations, clean layout.
 */
export default function LandingPageV2() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeatureShowcase />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
      <FAQSection />
      <Footer />
    </main>
  );
}

