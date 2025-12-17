//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

// CDN Configuration - only use in production when explicitly enabled
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '');
const isProduction = process.env.NODE_ENV === 'production';
// DEBUG_CDN=true means disable CDN (debug mode), false/undefined means enable CDN in production
const debugCdn = process.env.NEXT_PUBLIC_DEBUG_CDN === 'true';
// Only use CDN in production when CDN_URL is set and not in debug mode
const shouldUseCdn = isProduction && CDN_URL && !debugCdn;

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  transpilePackages: [
    '@ryla/ui',
    '@ryla/shared',
    '@ryla/business',
    '@ryla/analytics',
  ],
  // Standalone output for Docker deployment
  output: 'standalone',
  // Fix standalone output path structure for monorepo
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // CDN asset prefix - only in production when CDN is enabled
  assetPrefix: shouldUseCdn ? CDN_URL : undefined,
  // Optimize images
  images: {
    unoptimized: true,
    // Allow CDN images if CDN is enabled
    remotePatterns: shouldUseCdn
      ? [
          {
      protocol: 'https',
      hostname: new URL(CDN_URL).hostname,
      pathname: '/**',
          },
        ]
      : [],
  },
  // Experimental settings
  experimental: {
    // Reduce bundle size
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
