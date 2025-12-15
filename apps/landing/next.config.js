//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  transpilePackages: ['@ryla/ui', '@ryla/shared', '@ryla/business'],
  // Standalone output for Docker deployment
  output: 'standalone',
  // Optimize images
  images: {
    unoptimized: true,
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
