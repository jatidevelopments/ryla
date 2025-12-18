/**
 * Pricing Structured Data (JSON-LD) Component
 *
 * Provides product/offer structured data for ChatGPT Search optimization
 * Based on research: ChatGPT Search looks for Product schema with offers
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '29',
    period: '/mo',
    features: [
      '1 AI persona',
      '100 posts/month',
      '3 platforms',
      'Community access',
    ],
  },
  {
    name: 'Pro',
    price: '79',
    period: '/mo',
    features: [
      '5 AI personas',
      '500 posts/month',
      'Unlimited platforms',
      'All courses included',
      'Live earnings dashboard',
    ],
  },
  {
    name: 'Studio',
    price: '299',
    period: '/mo',
    features: [
      'Unlimited personas',
      'Unlimited posts',
      'Priority support',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
];

export function PricingStructuredData() {
  // Create Product schema with multiple offers (pricing tiers)
  const productWithOffers = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'RYLA - AI Influencer Creator',
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click.',
    image: `${SITE_URL}/share-ryla.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'RYLA',
    },
    category: 'Software > AI Content Creation',
    // Multiple offers for different pricing tiers
    offers: pricingTiers.map((tier) => ({
      '@type': 'Offer',
      name: `RYLA ${tier.name} Plan`,
      price: tier.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      description: `RYLA ${tier.name} plan: ${tier.features.join(', ')}`,
      eligibleRegion: 'US',
      // Billing period
      billingIncrement: tier.period === '/mo' ? 'P1M' : 'P1Y',
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    // Key features for ChatGPT Search
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Character Consistency',
        value: '100%',
      },
      {
        '@type': 'PropertyValue',
        name: 'Image Generation',
        value: 'Yes',
      },
      {
        '@type': 'PropertyValue',
        name: 'Video Generation',
        value: 'Yes',
      },
      {
        '@type': 'PropertyValue',
        name: 'Lipsync Support',
        value: 'Yes',
      },
      {
        '@type': 'PropertyValue',
        name: 'Content Scheduling',
        value: 'Yes',
      },
      {
        '@type': 'PropertyValue',
        name: 'Platforms Supported',
        value: 'TikTok, Instagram, Twitter, YouTube',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productWithOffers) }}
    />
  );
}
