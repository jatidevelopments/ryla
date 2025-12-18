/**
 * Structured Data (JSON-LD) Component
 *
 * Provides structured data for SEO and AI crawlers (ChatGPT, Google, etc.)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

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
      'AI influencer creation platform with hyper-realistic character consistency, image and video generation, and content scheduling. Create AI influencers that earn 24/7 with perfect character consistency across all content.',
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
    </>
  );
}
