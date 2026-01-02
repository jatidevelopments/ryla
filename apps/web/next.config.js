//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ryla/ui', '@ryla/shared', '@ryla/business'],
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
          checkResource(resource, context) {
            // Ignore pg and related packages
            if (resource === 'pg' || resource === 'pg-native') {
              return true;
            }
            // Also ignore pg when imported from drizzle-orm
            if (context && context.includes('drizzle-orm') && resource.includes('pg')) {
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
    }
    return config;
  },
};

module.exports = nextConfig;
