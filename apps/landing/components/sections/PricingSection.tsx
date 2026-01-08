'use client';

import { Section, SectionHeader, PricingCard } from '@/components/ryla-ui';
import { FadeInUp } from '@/components/animations';
import { FUNNEL_URL } from '@/lib/constants';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

// V4 Minimal: 3 tiers, short feature lists
const tiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    features: [
      '30,000 monthly credits',
      'Unlimited AI characters',
      'Access to all modes',
      'Standard support',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    features: [
      '60,000 monthly credits',
      'Unlimited AI characters',
      'Priority generation',
      'Priority support',
      'Early access features',
    ],
    highlighted: true,
    cta: 'Get Pro',
  },
  {
    name: 'Unlimited',
    price: '$99',
    period: '/mo',
    features: [
      'Unlimited credits',
      'Unlimited AI characters',
      'Maximum priority',
      'Dedicated success manager',
      'API access (soon)',
    ],
    cta: 'Contact Sales',
  },
];

/**
 * PricingSection Component (V4 Minimal)
 *
 * 3 tiers, short features, one CTA per tier.
 */
export function PricingSection() {
  return (
    <Section id="pricing" background="default" className="bg-transparent">
      <FadeInUp>
        <SectionHeader
          title="Simple pricing. Start free."
          titleHighlight="Start free"
        />
      </FadeInUp>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {tiers.map((tier, index) => (
          <FadeInUp key={tier.name} delay={index * 100}>
            <PricingCard
              name={tier.name}
              price={tier.price}
              period={tier.period}
              features={tier.features}
              highlighted={tier.highlighted}
              ctaText={tier.cta}
              ctaHref={FUNNEL_URL}
            />
          </FadeInUp>
        ))}
      </div>
    </Section>
  );
}

export default PricingSection;
