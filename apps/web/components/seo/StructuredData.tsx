/**
 * Structured Data (JSON-LD) Component
 *
 * Provides structured data for SEO and AI crawlers (ChatGPT, Google, etc.)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.ryla.ai';

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RYLA',
    url: SITE_URL,
    logo: `${SITE_URL}/logos/Ryla_Logo_white.png`,
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more.',
    sameAs: [
      'https://twitter.com/RylaAI',
      // Add other social media links when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@ryla.ai',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RYLA',
    url: SITE_URL,
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RYLA',
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}`,
    },
    description:
      'AI influencer creation platform with hyper-realistic character consistency, image and video generation, and content scheduling. Create AI influencers that earn 24/7 with perfect character consistency across all content. Starting at $29/month.',
    featureList: [
      'Hyper-realistic AI influencer generation',
      '100% character consistency',
      'Image and video generation',
      'Lipsync video creation',
      'Content scheduling',
      'Multi-platform integration',
      'Earnings tracking',
    ],
    screenshot: `${SITE_URL}/share-ryla.jpg`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
    // Additional fields for ChatGPT Search optimization
    applicationSubCategory: 'AI Content Creation',
    downloadUrl: `${SITE_URL}`,
    softwareVersion: '1.0',
    releaseNotes:
      'Create hyper-realistic AI influencers with perfect character consistency',
  };

  // Product Schema for ChatGPT Search (optimized for product discovery)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'RYLA - AI Influencer Creator',
    description:
      'Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click. Starting at $29/month.',
    image: `${SITE_URL}/share-ryla.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'RYLA',
    },
    category: 'Software > AI Content Creation',
    offers: {
      '@type': 'Offer',
      price: '29',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
    </>
  );
}
