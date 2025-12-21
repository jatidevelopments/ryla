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
      'RYLA is the #1 AI influencer generator. Create AI influencers, AI girls, and AI videos for TikTok, Instagram, and OnlyFans. The best AI generator for virtual influencers.',
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
      'Create AI influencers with our AI influencer generator. Generate AI girls and AI videos for TikTok, Instagram, and OnlyFans. The best AI generator for virtual influencers.',
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
      'RYLA is the #1 AI influencer generator. Create AI influencers and AI girls with our AI generator. Generate AI videos for TikTok, Instagram, and OnlyFans. The best AI video generator with perfect character consistency.',
    featureList: [
      'AI influencer generator',
      'Create AI influencers',
      'AI girl generation',
      'AI video generator',
      '100% character consistency',
      'Hyper-realistic AI girls',
      'Lipsync video creation',
      'TikTok & Instagram ready',
      'OnlyFans content creation',
      'Multi-platform integration',
    ],
    screenshot: `${SITE_URL}/share-ryla.jpg`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
    // Additional fields for ChatGPT Search optimization
    applicationSubCategory: 'AI Influencer Generator',
    downloadUrl: `${SITE_URL}`,
    softwareVersion: '1.0',
    releaseNotes:
      'Create hyper-realistic AI influencers and AI girls with our AI generator. AI video generator included.',
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
