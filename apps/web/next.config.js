//@ts-check

const path = require('path');

const withSerwist = require('@serwist/next').default({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output mode: 'standalone' for Fly.io, 'export' for Cloudflare Pages
  // Set CLOUDFLARE_PAGES=true when building for Cloudflare Pages
  output: process.env.CLOUDFLARE_PAGES === 'true' ? 'export' : 'standalone',
  // Fix standalone output path structure for monorepo (only needed for standalone)
  ...(process.env.CLOUDFLARE_PAGES !== 'true' && {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
  // Disable production source maps in development to prevent stack overflow
  // This fixes the "Maximum call stack size exceeded" error in Next.js dev overlay
  // NOTE: If you still see this error after this fix, clear the .next cache:
  //   rm -rf apps/web/.next
  productionBrowserSourceMaps: false,
  // Images are pulled from Git LFS during deployment (checkout with lfs: true)
  transpilePackages: [
    '@ryla/ui',
    '@ryla/shared',
    '@ryla/business',
    '@ryla/trpc',
    '@ryla/payments',
    '@ryla/analytics',
  ],
  // Note: @ryla/data is NOT transpiled - it's server-only and should never be in client bundles
  // Optimize package imports to ensure animations work in production
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Browser compatibility: Next.js SWC automatically respects browserslist from package.json
  // This ensures transpilation targets match our >98% browser coverage goal
  compiler: {
    // SWC will use browserslist config for transpilation targets
    // No additional config needed - browserslist is automatically detected
  },
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
        hostname: 'cdn.ryla.ai',
        pathname: '/**',
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
  webpack: (config, { isServer, webpack, dev }) => {
    // Disable source maps completely in development to prevent stack overflow in dev overlay
    // This fixes the "Maximum call stack size exceeded" error when Next.js tries to process source maps
    // The error occurs in RegExp.exec when processing malformed or circular source map references
    if (dev) {
      // Completely disable source maps for both client and server builds
      config.devtool = false;

      // Suppress source map related warnings and errors
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          message: /Failed to get source map/,
        },
        {
          message: /Maximum call stack size exceeded/,
        },
        {
          module: /source-map/,
        },
      ];
    }

    // Ensure .js extension is included in resolve.extensions for subpath imports
    if (!config.resolve.extensions) {
      config.resolve.extensions = [];
    }
    // Ensure .js is first (before .ts, .tsx) for dist folder imports
    const existingExtensions = Array.isArray(config.resolve.extensions)
      ? config.resolve.extensions
      : [];
    config.resolve.extensions = [
      '.js',
      ...existingExtensions.filter(
        (/** @type {string} */ ext) => typeof ext === 'string' && ext !== '.js'
      ),
    ];

    // Add dist/libs to modules for better subpath resolution
    if (!config.resolve.modules) {
      config.resolve.modules = [];
    }
    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, '../../dist/libs'),
    ];

    // Resolve @ryla/* packages to dist folder
    config.resolve.alias = {
      ...config.resolve.alias,
      // @/ alias for app directory
      '@': path.resolve(__dirname, './'),
      // @ryla/* package aliases
      // Point to directories, webpack will resolve index.js automatically
      '@ryla/ui': path.resolve(__dirname, '../../dist/libs/ui/src'),
      '@ryla/shared': path.resolve(__dirname, '../../libs/shared/src'),
      '@ryla/business': path.resolve(__dirname, '../../libs/business/src'),
      '@ryla/trpc': path.resolve(__dirname, '../../dist/libs/trpc/src'),
      '@ryla/trpc/client': path.resolve(
        __dirname,
        '../../dist/libs/trpc/src/client'
      ),
      '@ryla/trpc/context': path.resolve(
        __dirname,
        '../../dist/libs/trpc/src/context'
      ),
      '@ryla/payments': path.resolve(__dirname, '../../dist/libs/payments/src'),
      '@ryla/analytics': path.resolve(
        __dirname,
        '../../dist/libs/analytics/src'
      ),
      // @ryla/data is server-only, but we need the alias for build-time resolution
      '@ryla/data': path.resolve(__dirname, '../../dist/libs/data/src'),
      // @ryla/email is server-only, but we need the alias for build-time resolution
      '@ryla/email': path.resolve(__dirname, '../../dist/libs/email/src'),
    };

    // Configure webpack to treat ES modules in dist folder as modules
    config.module.rules.push({
      test: /\.js$/,
      include: [
        path.resolve(__dirname, '../../dist/libs/ui'),
        path.resolve(__dirname, '../../dist/libs/trpc'),
        path.resolve(__dirname, '../../dist/libs/payments'),
        path.resolve(__dirname, '../../dist/libs/analytics'),
      ],
      parser: {
        sourceType: 'module',
      },
    });

    // Ensure tw-animate-css is properly resolved for CSS imports
    // The package exports CSS that needs to be resolved correctly
    if (!isServer) {
      // Add alias to help resolve tw-animate-css CSS imports
      config.resolve.alias['tw-animate-css'] = path.resolve(
        __dirname,
        '../../node_modules/tw-animate-css'
      );
    }

    // Handle node: protocol (Node 16+) in client bundle - webpack doesn't support it by default
    if (!isServer) {
      const emptyModulePath = path.resolve(
        __dirname,
        './lib/trpc/empty-module.js'
      );
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:assert$/,
          emptyModulePath
        )
      );
    }

    // Exclude server-only modules from client bundle
    if (!isServer) {
      const emptyModulePath = path.resolve(
        __dirname,
        './lib/trpc/empty-module.js'
      );
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
        // node: protocol (Node 16+) - replace with empty module so client bundle doesn't fail
        assert: emptyModulePath,
        'node:assert': emptyModulePath,
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
            if (
              resource === '@ryla/email' ||
              resource.includes('@ryla/email')
            ) {
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
            // Ignore drizzle-orm pg-core imports (PostgreSQL-specific)
            if (
              resource.includes('drizzle-orm') &&
              resource.includes('pg-core')
            ) {
              return true;
            }
            // Ignore drizzle-orm imports that reference pg-core via relative paths
            if (
              context &&
              context.includes('drizzle-orm') &&
              (resource.includes('pg-core') || resource.includes('../pg-core'))
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

      // Replace drizzle-orm pg-core imports (PostgreSQL-specific modules)
      // These are dynamically imported by drizzle-orm and cause client bundle errors
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /drizzle-orm\/.*\/pg-core/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );

      // Replace drizzle-orm sql module imports that reference pg-core
      // The sql.js file tries to import pg-core/columns/enum.js which doesn't exist in client bundle
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /drizzle-orm\/sql\/sql\.js$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );

      // Replace drizzle-orm sql expressions that import pg-core
      // These modules are imported by sql.js and cause client bundle errors
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /drizzle-orm\/sql\/expressions\/conditions\.js$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );

      // Replace drizzle-orm pg-core imports (resolved paths)
      // When sql.js imports '../pg-core/columns/enum.js', webpack resolves it to drizzle-orm/pg-core/columns/enum.js
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^drizzle-orm\/pg-core/,
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

    // Fix file-type import issue from @nestjs/common
    // @nestjs/common tries to import file-type with root path (.) which newer versions don't export
    // This is a compatibility issue between @nestjs/common and newer file-type versions
    // Since @nestjs/common is only used server-side (in @ryla/data), we need to handle this properly

    if (!isServer) {
      // On client side, file-type should never be needed (NestJS is server-only)
      // Replace with empty module to prevent client bundle errors
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^file-type$/,
          require.resolve('./lib/trpc/empty-module.js')
        )
      );
    }

    // Suppress file-type related warnings since it's a known compatibility issue
    // and doesn't affect functionality (NestJS is only used server-side)
    // The warnings occur because @nestjs/common imports file-type in a way that's incompatible
    // with newer versions, but this doesn't break functionality since NestJS is server-only
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /file-type/,
      },
      {
        module: /@nestjs\/common.*file-type/,
      },
      {
        module: /load-esm/,
      },
      {
        message: /Can't resolve 'file-type'/,
      },
      {
        message: /Package path . is not exported/,
      },
      {
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      // Suppress drizzle-orm pg-core related warnings (server-only modules)
      {
        module: /drizzle-orm.*pg-core/,
      },
      {
        message: /Cannot find module.*pg-core/,
      },
      {
        message: /Cannot find module.*drizzle-orm/,
      },
    ];

    return config;
  },
};

module.exports = withSerwist(nextConfig);
