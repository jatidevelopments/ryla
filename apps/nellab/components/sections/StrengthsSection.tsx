import { CardSpotlight } from '@/components/ui';
import { StrengthIllustration } from '@/components/illustrations';

const STRENGTHS = [
  {
    title: 'Innovative AI development',
    description:
      'We continuously innovate to create cutting-edge AI products that set industry benchmarks.',
    variant: 'innovation' as const,
  },
  {
    title: 'Data-driven growth',
    description:
      'We leverage AI and data analytics to optimize every aspect of our operations and product offerings.',
    variant: 'data' as const,
  },
  {
    title: 'Scalable platforms',
    description:
      'Our platforms are built with scalability at their core, enabling rapid growth and adaptation.',
    variant: 'scale' as const,
  },
];

export function StrengthsSection() {
  return (
    <section id="strengths" className="px-6 py-28 md:py-36">
      <div className="mx-auto max-w-5xl">
        <p className="section-eyebrow text-center mb-3">What we do</p>
        <h2 className="text-center text-4xl font-semibold tracking-tight text-[var(--nel-text)] md:text-5xl">
          Innovation, scale, and growth
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[17px] text-[var(--nel-text-secondary)]">
          We combine technical excellence with a focus on outcomes that matter.
        </p>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {STRENGTHS.map((item) => (
            <CardSpotlight key={item.title} className="p-0 overflow-hidden">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl border-b border-[var(--nel-border)] bg-[var(--nel-bg)]">
                <StrengthIllustration variant={item.variant} />
              </div>
              <div className="px-6 py-8">
                <h3 className="text-[21px] font-semibold text-[var(--nel-text)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-[17px] leading-[1.5] text-[var(--nel-text-secondary)]">
                  {item.description}
                </p>
              </div>
            </CardSpotlight>
          ))}
        </div>
      </div>
    </section>
  );
}
