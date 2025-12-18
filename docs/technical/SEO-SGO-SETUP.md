# SEO & SGO (Search Generative Optimization) Setup Guide

Complete guide for optimizing RYLA applications for traditional SEO and AI-powered search engines (ChatGPT, Claude, Perplexity, etc.).

## Table of Contents

1. [Overview](#overview)
2. [Traditional SEO Setup](#traditional-seo-setup)
3. [SGO (AI Search) Optimization](#sgo-ai-search-optimization)
4. [Implementation Checklist](#implementation-checklist)
5. [Testing & Validation](#testing--validation)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

### What is SEO?

**Search Engine Optimization** - Optimizing content for traditional search engines (Google, Bing, etc.)

### What is SGO?

**Search Generative Optimization** - Optimizing content for AI-powered search engines (ChatGPT Search, Perplexity, Claude, etc.)

### Key Differences

| Aspect      | Traditional SEO     | SGO (AI Search)                     |
| ----------- | ------------------- | ----------------------------------- |
| **Crawler** | Googlebot, Bingbot  | OAI-SearchBot, GPTBot, CCBot        |
| **Focus**   | Keywords, backlinks | Structured data, natural language   |
| **Ranking** | Algorithm-based     | LLM-based understanding             |
| **Content** | Keyword density     | Comprehensive, natural descriptions |
| **Schema**  | Helpful             | Critical                            |

---

## Traditional SEO Setup

### 1. Metadata Configuration

#### Root Layout (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Your Page Title',
    template: '%s | Your Site',
  },
  description: 'Comprehensive description (150-160 characters)',
  keywords: ['relevant', 'keywords', 'array'],
  authors: [{ name: 'Your Brand' }],
  creator: 'Your Brand',
  publisher: 'Your Brand',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Your Brand',
    title: 'Your Page Title',
    description: 'OG description',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Image description',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Page Title',
    description: 'Twitter description',
    images: ['/og-image.jpg'],
    creator: '@YourHandle',
    site: '@YourHandle',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    shortcut: '/favicon/favicon.ico',
  },
  manifest: '/favicon/site.webmanifest',
  alternates: {
    canonical: '/',
  },
};
```

### 2. Page-Specific Metadata

Each page should have its own metadata:

```typescript
// app/contact/page.tsx
export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us...',
  openGraph: {
    title: 'Contact Us | Your Brand',
    description: 'Get in touch...',
    url: `${SITE_URL}/contact`,
  },
  alternates: {
    canonical: '/contact',
  },
};
```

### 3. Dynamic Sitemap

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add all pages
  ];
}
```

### 4. Robots.txt

Create `public/robots.txt`:

```txt
# Allow all crawlers
User-agent: *
Allow: /

# Sitemap
Sitemap: https://yoursite.com/sitemap.xml
```

---

## SGO (AI Search) Optimization

### 1. Allow AI Crawlers

**CRITICAL**: Update `public/robots.txt`:

```txt
# OpenAI ChatGPT Search Crawler (CRITICAL)
User-agent: OAI-SearchBot
Allow: /

# Other AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /
```

### 2. Structured Data (JSON-LD)

#### Organization Schema

```typescript
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Your Brand',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Your description',
  sameAs: ['https://twitter.com/yourhandle'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@yoursite.com',
  },
};
```

#### Product Schema (for ChatGPT Search)

**CRITICAL for product discovery**:

```typescript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Your Product Name',
  description: 'Comprehensive description (50-500 characters)',
  image: `${SITE_URL}/product-image.jpg`,
  brand: {
    '@type': 'Brand',
    name: 'Your Brand',
  },
  category: 'Software > Your Category',
  offers: [
    {
      '@type': 'Offer',
      name: 'Plan Name',
      price: '29',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}`,
      priceValidUntil: '2026-12-31',
      description: 'Plan description',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  additionalProperty: [
    {
      '@type': 'PropertyValue',
      name: 'Feature Name',
      value: 'Feature Value',
    },
  ],
};
```

#### FAQ Schema

```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};
```

### 3. Content Optimization for AI

#### Description Guidelines

- **Length**: 50-500 characters (ChatGPT requirement)
- **Style**: Natural language, no keyword stuffing
- **Content**: Comprehensive, answer common questions
- **Include**: Price, key features, use cases

#### Example

❌ **Bad**: "AI influencer creator tool software platform"

✅ **Good**: "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Starting at $29/month."

### 4. Implementation Structure

```
components/
  seo/
    StructuredData.tsx          # Organization, WebSite, SoftwareApplication
    PricingStructuredData.tsx    # Product schema with offers
    FAQStructuredData.tsx        # FAQ schema
    index.ts                     # Exports
```

### 5. Integration

```typescript
// app/layout.tsx
import { StructuredData } from '@/components/seo/StructuredData';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}

// app/page.tsx
import { FAQStructuredData } from '@/components/seo/FAQStructuredData';
import { PricingStructuredData } from '@/components/seo/PricingStructuredData';

export default function Page() {
  return (
    <>
      <FAQStructuredData faqs={faqs} />
      <PricingStructuredData />
      {/* Page content */}
    </>
  );
}
```

---

## Implementation Checklist

### Traditional SEO

- [ ] Root layout metadata configured
- [ ] Page-specific metadata for all pages
- [ ] Open Graph tags for all pages
- [ ] Twitter Card tags for all pages
- [ ] Dynamic sitemap.ts created
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] Favicons and manifest configured
- [ ] Semantic HTML structure (`<article>`, `<section>`, etc.)

### SGO (AI Search)

- [ ] OAI-SearchBot allowed in robots.txt
- [ ] GPTBot, CCBot, anthropic-ai allowed
- [ ] Organization schema implemented
- [ ] WebSite schema implemented
- [ ] Product schema with offers (if applicable)
- [ ] FAQ schema (if applicable)
- [ ] SoftwareApplication schema (if applicable)
- [ ] AggregateRating schema (if applicable)
- [ ] Comprehensive descriptions (50-500 chars)
- [ ] Natural language content
- [ ] Price information in metadata
- [ ] High-quality images with alt text

---

## Testing & Validation

### 1. Google Rich Results Test

- URL: https://search.google.com/test/rich-results
- Tests: Structured data validation
- Fix: Any errors or warnings

### 2. Schema.org Validator

- URL: https://validator.schema.org/
- Tests: JSON-LD syntax
- Fix: Schema errors

### 3. ChatGPT Search Testing

**Manual Testing**:

1. Ask ChatGPT: "Find me [your product/service]"
2. Check if your site appears
3. Verify product information accuracy
4. Test different query variations

**Note**: Indexing can take weeks/months. Be patient.

### 4. robots.txt Testing

- URL: `https://yoursite.com/robots.txt`
- Verify: OAI-SearchBot is allowed
- Test: `curl -A "OAI-SearchBot" https://yoursite.com/robots.txt`

### 5. Sitemap Validation

- URL: `https://yoursite.com/sitemap.xml`
- Verify: All pages included
- Check: Last modified dates
- Validate: XML syntax

---

## Monitoring & Maintenance

### 1. Regular Updates

- **Weekly**: Check for new pages to add to sitemap
- **Monthly**: Review and update descriptions
- **Quarterly**: Validate all structured data
- **Annually**: Update priceValidUntil dates

### 2. Monitoring Tools

- **Google Search Console**: Track indexing, search performance
- **Bing Webmaster Tools**: Monitor Bing indexing
- **Schema Markup Validator**: Regular validation
- **ChatGPT Search**: Manual testing queries

### 3. Key Metrics

- **Indexing Status**: Pages indexed in Google/Bing
- **Rich Results**: Rich snippets appearing in search
- **ChatGPT Visibility**: Products appearing in ChatGPT Search
- **Click-Through Rate**: From search results
- **Structured Data Errors**: Fix immediately

### 4. Common Issues

**Problem**: Products not appearing in ChatGPT Search

- **Check**: OAI-SearchBot allowed in robots.txt
- **Check**: Product schema properly formatted
- **Check**: Descriptions are comprehensive (50-500 chars)
- **Solution**: Wait for indexing (can take weeks)

**Problem**: Structured data errors

- **Check**: JSON-LD syntax
- **Check**: Required fields present
- **Solution**: Use Google Rich Results Test

**Problem**: Sitemap not updating

- **Check**: sitemap.ts is dynamic
- **Check**: Last modified dates
- **Solution**: Ensure sitemap regenerates on build

---

## Best Practices

### Content

1. **Natural Language**: Write for humans, not algorithms
2. **Comprehensive**: Answer common questions in descriptions
3. **Accurate**: Keep prices and availability current
4. **Fresh**: Update content regularly

### Technical

1. **Mobile-First**: Ensure responsive design
2. **Fast Loading**: Optimize images and code
3. **Accessible**: Use semantic HTML
4. **Valid**: All structured data must validate

### Strategy

1. **Patience**: AI indexing takes time
2. **Quality Over Quantity**: Better to have fewer, well-optimized pages
3. **Monitor**: Track what works and iterate
4. **Stay Updated**: AI search evolves rapidly

---

## Resources

### Official Documentation

- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [OpenAI ChatGPT Search](https://help.openai.com/en/articles/11128490-improved-shopping-results-from-chatgpt-search)

### Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

### Research

- See `/Users/admin/Documents/Projects/CHatGPTSGO/CHATGPT_SEARCH_RESEARCH.md` for detailed ChatGPT Search research

---

## Quick Reference

### Required Structured Data Fields

**Product Schema**:

- `name` ✅
- `description` ✅
- `image` ✅
- `offers.price` ✅
- `offers.priceCurrency` ✅
- `offers.availability` ✅
- `offers.url` ✅

**Recommended Fields**:

- `brand`
- `category`
- `aggregateRating`
- `additionalProperty`
- `offers.priceValidUntil`

### robots.txt Template

```txt
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

---

**Last Updated**: December 2024
**Status**: Production Ready
**Maintained By**: RYLA Development Team
