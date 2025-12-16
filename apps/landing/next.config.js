//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

// CDN Configuration
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  transpilePackages: ['@ryla/ui', '@ryla/shared', '@ryla/business', '@ryla/analytics'],
  // Standalone output for Docker deployment
  output: 'standalone',
  // Fix standalone output path structure for monorepo
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // CDN asset prefix for production builds
  assetPrefix: CDN_URL || undefined,
  // Optimize images
  images: {
    unoptimized: true,
    // Allow CDN images if configured
    remotePatterns: CDN_URL ? [{
      protocol: 'https',
      hostname: new URL(CDN_URL).hostname,
      pathname: '/**',
    }] : [],
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
