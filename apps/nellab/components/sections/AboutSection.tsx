import { AboutIllustration } from '@/components/illustrations';

export function AboutSection() {
  return (
    <section id="about" className="px-6 py-28 md:py-36">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-20">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-[var(--nel-border)] bg-[var(--nel-bg)] shadow-xl shadow-black/30 order-2 md:order-1">
            <AboutIllustration className="h-[90%] w-[90%]" />
          </div>
          <div className="order-1 md:order-2">
            <p className="section-eyebrow mb-3">Who we are</p>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--nel-text)] md:text-5xl">
              About us
            </h2>
            <p className="mt-8 text-[19px] leading-[1.6] text-[var(--nel-text-secondary)]">
              Our mission is to build and scale AI products and SaaS that
              transform consumer and enterprise experiences. We combine
              excellence, innovation, and delivery to develop AI solutions that
              meet market needs and thrive in the industry.
            </p>
            <a
              href="#contact"
              className="mt-10 inline-flex items-center gap-2 text-[17px] font-medium text-[var(--nel-accent)] underline-offset-4 transition-colors hover:underline hover:text-[var(--nel-accent-hover)]"
            >
              Get in touch
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
