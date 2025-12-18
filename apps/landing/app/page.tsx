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
import { FAQStructuredData } from '@/components/seo/FAQStructuredData';
import { PricingStructuredData } from '@/components/seo/PricingStructuredData';
import { faqs } from '@/data/faqs';

/**
 * RYLA Landing Page (V4 Minimal Copy)
 *
 * Mobbin-inspired design with minimal copy (~400 words total).
 * Purple gradient accents, subtle scroll animations, clean layout.
 */
export default function LandingPage() {
  return (
    <>
      <FAQStructuredData faqs={faqs} />
      <PricingStructuredData />
      <main className="min-h-screen bg-[var(--bg-primary)]">
        <Navigation />
        {/* Hero section with solid black background - no background image */}
        <HeroSection />

        {/* All sections below Hero with background.jpg */}
        <div className="relative z-10">
          {/* Background Image - Fixed position to prevent repaint on scroll */}
          <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/background.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed', // Keeps background fixed during scroll
              opacity: 0.4,
              transform: 'translateZ(0)', // Force GPU acceleration
              backfaceVisibility: 'hidden', // Optimize rendering
              willChange: 'auto', // Remove will-change after initial render
              contain: 'layout style paint', // Isolate rendering
            }}
            aria-hidden="true"
          />
          {/* Black overlay - Fixed to match background */}
          <div
            className="fixed inset-0 z-0 pointer-events-none bg-black/60"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
          {/* Top fade gradient - black fading in */}
          <div
            className="fixed inset-x-0 top-0 h-32 z-[1] pointer-events-none bg-gradient-to-b from-[var(--bg-primary)] to-transparent"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
          {/* Bottom fade gradient - black fading out */}
          <div
            className="fixed inset-x-0 bottom-0 h-32 z-[1] pointer-events-none bg-gradient-to-t from-[var(--bg-primary)] to-transparent"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
          {/* Content - Semantic structure for AI crawlers */}
          <div className="relative z-10">
            <article itemScope itemType="https://schema.org/Article">
              <StatsSection />
              <FeatureShowcase />
              <HowItWorksSection />
              <TestimonialsSection />
              <PricingSection />
              <FinalCTASection />
              <FAQSection />
            </article>
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
