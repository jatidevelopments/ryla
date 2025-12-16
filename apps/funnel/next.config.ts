import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("i18n/request.ts");
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
const CDN_HOST = CDN_URL ? new URL(CDN_URL).hostname : undefined;

const remoteImagePatterns: RemotePattern[] = [
    {
        protocol: "https",
        hostname: "s3mdc.b-cdn.net",
        port: "",
        pathname: "/**",
    },
    {
        protocol: "https",
        hostname: "cdn.mydreamcompanion.com",
        port: "",
        pathname: "/**",
    },
    {
        protocol: "https",
        hostname: "dqc6twgow1yyh.cloudfront.net",
        port: "",
        pathname: "/**",
    },
    {
        protocol: "https",
        hostname: "dk1lw6jc39ysu.cloudfront.net", // ← ДОБАВЬТЕ ЭТУ СТРОКУ
        port: "",
        pathname: "/**",
    },
];

if (CDN_HOST) {
    remoteImagePatterns.push({
        protocol: "https",
        hostname: CDN_HOST,
        port: "",
        pathname: "/**",
    });
}

const nextConfig: NextConfig = {
    output: "standalone",
    // Fix standalone output path structure for Nx monorepo
    outputFileTracingRoot: path.join(__dirname, "../../"),
    /* config options here */

    // PostHog proxy configuration
    async rewrites() {
        return [
            {
                source: "/ingest/:path*",
                destination: "https://eu.i.posthog.com/:path*", // Proxy to PostHog EU cloud service
            },
        ];
    },

    turbopack: {},

    webpack(config) {
        // Grab the existing rule that handles SVG imports
        // eslint-disable-next-line
        // @ts-ignore - rules is a private property that is not typed
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));

        // Exclude SVG files from the default file-loader
        if (fileLoaderRule) {
            fileLoaderRule.exclude = /\.svg$/i;
        }

        // Add a new rule for @svgr/webpack
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: { not: /\.(css|scss|sass)$/ }, // Exclude SVGs imported from CSS
            use: ["@svgr/webpack"],
        });

        return config;
    },

    assetPrefix: CDN_URL || undefined,

    images: {
        // 🔥 IMAGE OPTIMIZATION ENHANCEMENTS
        formats: ["image/webp", "image/avif"], // Modern formats (up to 50% smaller file size)

        // Extended size ranges for better responsive image selection
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

        // Performance and security settings
        minimumCacheTTL: 31536000, // 1 year cache TTL for static images
        dangerouslyAllowSVG: false, // Security: disable SVG optimization

        // Your existing remote patterns + new CloudFront domain
        remotePatterns: remoteImagePatterns,

        // 🚀 IMAGE OPTIMIZATION ENABLED FOR ALL ENVIRONMENTS
        // Next.js will automatically optimize images in production
        // Formats: WebP/AVIF for modern browsers, fallback to original format
    },

    // 🔥 ADDITIONAL PERFORMANCE OPTIMIZATIONS
    experimental: {
        optimizePackageImports: ["lucide-react"], // Tree-shake icon libraries
        scrollRestoration: true, // Better navigation UX
    },

    // Enable gzip/brotli compression
    compress: true,

    // CDN asset prefix for production builds
    // ...(process.env.NODE_ENV === "production" && {
    //   assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || "",
    // }),
};

export default withNextIntl(nextConfig);
