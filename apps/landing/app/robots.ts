import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ryla.ai';

/**
 * Robots.txt Configuration
 *
 * Allows all search engines (Google, Bing, etc.) and AI agents to crawl the site.
 * No blocking - everything is accessible for maximum discoverability.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General rule: Allow all crawlers access to everything
      {
        userAgent: '*',
        allow: '/',
      },
      // Google Search Crawlers
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Video',
        allow: '/',
      },
      // Bing Search Crawler
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      // OpenAI ChatGPT Search Crawler (CRITICAL for ChatGPT Search)
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/contact', '/privacy', '/terms'],
      },
      // OpenAI GPTBot (for training)
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      // ChatGPT User Agent
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      // Common Crawl (used by many AI services)
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      // Anthropic Claude Crawlers
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      // Other AI Crawlers
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
