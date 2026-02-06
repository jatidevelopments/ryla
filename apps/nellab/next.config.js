//@ts-check
const { composePlugins, withNx } = require('@nx/next');

/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig = {
  nx: {},
  // Static export for Cloudflare Pages when CLOUDFLARE_PAGES=true
  output: process.env.CLOUDFLARE_PAGES === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.CLOUDFLARE_PAGES === 'true',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = composePlugins(withNx)(nextConfig);
