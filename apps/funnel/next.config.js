/** @type {import('next').NextConfig} */
const path = require('path');

// Temporarily disable next-intl to fix React 18 compatibility
const withNextIntl = (config) => config; // No-op for now
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
const CDN_HOST = CDN_URL ? new URL(CDN_URL).hostname : undefined;

const remoteImagePatterns = [
  {
    protocol: 'https',
    hostname: 's3mdc.b-cdn.net',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'cdn.mydreamcompanion.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'dqc6twgow1yyh.cloudfront.net',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'dk1lw6jc39ysu.cloudfront.net',
    port: '',
    pathname: '/**',
  },
];

if (CDN_HOST) {
  remoteImagePatterns.push({
    protocol: 'https',
    hostname: CDN_HOST,
    port: '',
    pathname: '/**',
  });
}

const nextConfig = {
  // Output mode: 'standalone' for Fly.io, 'export' for Cloudflare Pages
  // Set CLOUDFLARE_PAGES=true when building for Cloudflare Pages
  output: process.env.CLOUDFLARE_PAGES === 'true' ? 'export' : 'standalone',
  // Fix standalone output path structure for Nx monorepo (only needed for standalone)
  ...(process.env.CLOUDFLARE_PAGES !== 'true' && {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
  // Transpile shared libs from monorepo
  transpilePackages: [
    '@ryla/shared',
    '@ryla/analytics',
    '@ryla/business',
    '@ryla/ui',
    '@ryla/payments',
    'posthog-js',
  ],
  /* config options here */

  // Skip static optimization to avoid React bundling issues during build
  // All pages will be rendered dynamically at request time
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // PostHog proxy configuration
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*', // Proxy to PostHog EU cloud service
      },
    ];
  },

  webpack(config, { dev }) {
    // Ensure node_modules resolution includes root for monorepo
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../../node_modules'),
    ];

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    // Exclude SVG files from the default file-loader
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Add a new rule for @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { not: /\.(css|scss|sass)$/ }, // Exclude SVGs imported from CSS
      use: ['@svgr/webpack'],
    });

    return config;
  },

  assetPrefix: CDN_URL || undefined,

  images: {
    // Disable image optimization for static export (Cloudflare Pages)
    // Image Optimization API doesn't work with output: 'export'
    unoptimized: process.env.CLOUDFLARE_PAGES === 'true',

    // 🔥 IMAGE OPTIMIZATION ENHANCEMENTS (only for non-static export)
    ...(process.env.CLOUDFLARE_PAGES !== 'true' && {
      formats: ['image/webp', 'image/avif'], // Modern formats (up to 50% smaller file size)

      // Extended size ranges for better responsive image selection
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

      // Performance and security settings
      minimumCacheTTL: 31536000, // 1 year cache TTL for static images
      dangerouslyAllowSVG: false, // Security: disable SVG optimization

      // Your existing remote patterns + new CloudFront domain
      remotePatterns: remoteImagePatterns,
    }),
  },

  // 🔥 ADDITIONAL PERFORMANCE OPTIMIZATIONS
  experimental: {
    // Only set outputFileTracingRoot for standalone mode (Fly.io)
    ...(process.env.CLOUDFLARE_PAGES !== 'true' && {
      outputFileTracingRoot: path.join(__dirname, '../../'),
    }),
    // optimizePackageImports: ['lucide-react'], // Tree-shake icon libraries
    scrollRestoration: true, // Better navigation UX
  },
  // Browser compatibility: Next.js SWC automatically respects browserslist from package.json
  // This ensures transpilation targets match our >98% browser coverage goal
  compiler: {
    // SWC will use browserslist config for transpilation targets
    // No additional config needed - browserslist is automatically detected
  },

  // Enable gzip/brotli compression
  compress: true,

  // CDN asset prefix for production builds
  // ...(process.env.NODE_ENV === "production" && {
  //   assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || "",
  // }),
};

module.exports = withNextIntl(nextConfig);
