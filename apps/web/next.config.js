//@ts-check

const path = require('path');

const withSerwist = require('@serwist/next').default({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ryla/ui', '@ryla/shared', '@ryla/business', '@ryla/trpc', '@ryla/payments', '@ryla/analytics'],
  // Note: @ryla/data is NOT transpiled - it's server-only and should never be in client bundles
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/ryla-images/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Resolve @ryla/* packages to dist folder
    config.resolve.alias = {
      ...config.resolve.alias,
      // @/ alias for app directory
      '@': path.resolve(__dirname, './'),
      // @ryla/* package aliases
      // Point to directories, webpack will resolve index.js automatically
      '@ryla/ui': path.resolve(__dirname, '../../dist/libs/ui/src'),
      '@ryla/shared': path.resolve(__dirname, '../../dist/libs/shared/src'),
      '@ryla/business': path.resolve(__dirname, '../../dist/libs/business/src'),
      '@ryla/trpc': path.resolve(__dirname, '../../dist/libs/trpc/src'),
      '@ryla/trpc/client': path.resolve(__dirname, '../../dist/libs/trpc/src/client'),
      '@ryla/trpc/context': path.resolve(__dirname, '../../dist/libs/trpc/src/context'),
      '@ryla/payments': path.resolve(__dirname, '../../dist/libs/payments/src'),
      '@ryla/analytics': path.resolve(__dirname, '../../dist/libs/analytics/src'),
      // @ryla/data is server-only, but we need the alias for build-time resolution
      '@ryla/data': path.resolve(__dirname, '../../dist/libs/data/src'),
      // @ryla/email is server-only, but we need the alias for build-time resolution
      '@ryla/email': path.resolve(__dirname, '../../dist/libs/email/src'),
    };

    // Exclude server-only modules from client bundle
    if (!isServer) {
      // Add all Node.js built-ins to fallback
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        child_process: false,
        'pg-native': false,
        pg: false, // Explicitly exclude pg
        path: false,
        os: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        querystring: false,
      };

      // Ignore server-only packages on client side
      config.plugins.push(
        new webpack.IgnorePlugin({
          /**
           * @param {string} resource
           * @param {string} context
           */
          checkResource(resource, context) {
            // Ignore @ryla/data and @ryla/email on client side (server-only)
            if (resource === '@ryla/data' || resource.includes('@ryla/data')) {
              return true;
            }
            if (resource === '@ryla/email' || resource.includes('@ryla/email')) {
              return true;
            }
            // Ignore pg and related packages
            if (resource === 'pg' || resource === 'pg-native') {
              return true;
            }
            // Also ignore pg when imported from drizzle-orm
            if (
              context &&
              context.includes('drizzle-orm') &&
              resource.includes('pg')
            ) {
              return true;
            }
            return false;
          },
        })
      );

      // Replace drizzle-orm node-postgres imports with empty module
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^drizzle-orm\/node-postgres$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );

      // Also replace any drizzle-orm imports that use pg
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /drizzle-orm\/node-postgres\/session/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );

      // Replace pg module with empty module on client side
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^pg$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );

      // Replace @ryla/data and @ryla/email with empty module on client side (server-only)
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@ryla\/data$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@ryla\/email$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );
    }
    return config;
  },
};

module.exports = withSerwist(nextConfig);
