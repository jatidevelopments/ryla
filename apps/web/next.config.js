//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ryla/ui', '@ryla/shared', '@ryla/business'],
};

module.exports = nextConfig;

