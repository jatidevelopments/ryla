//@ts-check

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@ryla/ui',
    '@ryla/shared',
    '@ryla/business',
    '@ryla/trpc',
    '@ryla/analytics',
  ],
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
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
      {
        protocol: 'https',
        hostname: 'cdn.ryla.ai',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Resolve @ryla/* packages to dist folder
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@ryla/ui': path.resolve(__dirname, '../../dist/libs/ui/src'),
      '@ryla/shared': path.resolve(__dirname, '../../dist/libs/shared/src'),
      '@ryla/business': path.resolve(__dirname, '../../dist/libs/business/src'),
      '@ryla/trpc': path.resolve(__dirname, '../../dist/libs/trpc/src'),
      '@ryla/trpc/client': path.resolve(
        __dirname,
        '../../dist/libs/trpc/src/client'
      ),
      '@ryla/trpc/context': path.resolve(
        __dirname,
        '../../dist/libs/trpc/src/context'
      ),
      '@ryla/analytics': path.resolve(
        __dirname,
        '../../dist/libs/analytics/src'
      ),
      '@ryla/data': path.resolve(__dirname, '../../dist/libs/data/src'),
      // Also handle subpath imports
      '@ryla/data/schema': path.resolve(__dirname, '../../dist/libs/data/src/schema'),
      '@ryla/data/repositories': path.resolve(__dirname, '../../dist/libs/data/src/repositories'),
    };

    // Configure webpack to treat ES modules in dist folder as modules
    config.module.rules.push({
      test: /\.js$/,
      include: [
        path.resolve(__dirname, '../../dist/libs/business'),
        path.resolve(__dirname, '../../dist/libs/shared'),
        path.resolve(__dirname, '../../dist/libs/ui'),
        path.resolve(__dirname, '../../dist/libs/trpc'),
        path.resolve(__dirname, '../../dist/libs/analytics'),
        path.resolve(__dirname, '../../dist/libs/data'),
      ],
      parser: {
        sourceType: 'module',
      },
    });

    // Ensure tw-animate-css is properly resolved
    if (!isServer) {
      config.resolve.alias['tw-animate-css'] = path.resolve(
        __dirname,
        '../../node_modules/tw-animate-css'
      );
    }

    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        child_process: false,
        'pg-native': false,
        pg: false,
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

      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            if (resource === '@ryla/data' || resource.includes('@ryla/data')) {
              return true;
            }
            if (resource === 'pg' || resource === 'pg-native') {
              return true;
            }
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
          require.resolve('./lib/empty-module.js')
        )
      );

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /drizzle-orm\/node-postgres\/session/,
          require.resolve('./lib/empty-module.js')
        )
      );

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^pg$/,
          require.resolve('./lib/empty-module.js')
        )
      );

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@ryla\/data$/,
          require.resolve('./lib/empty-module.js')
        )
      );

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^file-type$/,
          require.resolve('./lib/empty-module.js')
        )
      );
    }

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /file-type/,
      },
      {
        message: /Can't resolve 'file-type'/,
      },
      {
        message: /Package path . is not exported/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
