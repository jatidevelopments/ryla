import {
  Navigation,
  Footer,
  HeroSection,
  AboutSection,
  StrengthsSection,
  ExpertiseSection,
  AdvantagesSection,
  ContactSection,
} from '@/components/sections';
import { BackgroundGradientAnimation, GoogleGeminiEffect } from '@/components/ui';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen">
        <HeroSection />
        <AboutSection />
        <section className="relative min-h-[320px]">
          <BackgroundGradientAnimation
            gradientBackgroundStart="rgb(0, 0, 0)"
            gradientBackgroundEnd="rgb(0, 15, 35)"
            firstColor="6, 182, 212"
            secondColor="34, 211, 238"
            thirdColor="100, 220, 255"
            fourthColor="6, 182, 212"
            fifthColor="34, 211, 238"
            containerClassName="min-h-[320px]"
            interactive={false}
          >
            <div className="px-6 text-center">
              <p className="section-eyebrow mb-3">Our approach</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--nel-text)] md:text-4xl">
                AI that scales with you
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[17px] text-[var(--nel-text-secondary)]">
                From first prototype to global rollout—we build and grow AI products that deliver.
              </p>
            </div>
          </BackgroundGradientAnimation>
        </section>
        <StrengthsSection />
        <ExpertiseSection />
        <AdvantagesSection />
        <ContactSection />
        <GoogleGeminiEffect
          title="Ready to build?"
          description=" Let’s turn your AI vision into reality."
        />
        <Footer />
      </main>
    </>
  );
}
