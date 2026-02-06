import { GlowingStarsBackgroundCard } from '@/components/ui';
import { ExpertiseIcon } from '@/components/sections/ExpertiseIcons';

const EXPERTISE_AREAS = [
  {
    key: 'conversational',
    title: 'Conversational AI',
    description: 'Immersive, lifelike AI interactions and engagement.',
  },
  {
    key: 'scale',
    title: 'Scalable AI platforms',
    description: 'Robust platforms that grow with demand.',
  },
  {
    key: 'custom',
    title: 'Custom AI solutions',
    description: 'Tailored models and systems for your business.',
  },
  {
    key: 'paid',
    title: 'Paid advertising',
    description: 'Targeted traffic and ROI-focused campaigns.',
  },
  {
    key: 'organic',
    title: 'Organic & guerrilla marketing',
    description: 'Creative, cost-effective brand growth.',
  },
  {
    key: 'seo',
    title: 'Search engine optimization',
    description: 'Visibility and organic traffic that lasts.',
  },
] as const;

export function ExpertiseSection() {
  return (
    <section id="expertise" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto max-w-5xl">
        <p className="section-eyebrow mb-3">Capabilities</p>
        <h2 className="text-4xl font-semibold tracking-tight text-[var(--nel-text)] md:text-5xl">
          Our expertise
        </h2>
        <p className="mt-4 max-w-xl text-[17px] text-[var(--nel-text-secondary)]">
          Deep experience across AI product development, growth, and marketing.
        </p>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERTISE_AREAS.map((item) => (
            <GlowingStarsBackgroundCard
              key={item.title}
              className="group transition-all duration-300 hover:scale-[1.02] hover:border-[var(--nel-accent)]/40 hover:shadow-xl hover:shadow-[var(--nel-accent)]/10"
            >
              <div className="relative flex flex-col gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--nel-accent)]/15 text-[var(--nel-accent)] ring-1 ring-[var(--nel-accent)]/20 transition-all duration-300 group-hover:bg-[var(--nel-accent)]/25 group-hover:ring-[var(--nel-accent)]/30">
                  <ExpertiseIcon name={item.key} />
                </span>
                <div>
                  <h3 className="text-[19px] font-semibold leading-snug text-[var(--nel-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-[var(--nel-text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </div>
            </GlowingStarsBackgroundCard>
          ))}
        </div>
        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--nel-accent)] bg-[var(--nel-accent)]/10 px-6 py-3 text-[17px] font-medium text-[var(--nel-accent)] transition-colors hover:bg-[var(--nel-accent)]/20 hover:text-[var(--nel-accent-hover)]"
          >
            Contact us
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
