/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add transpilePackages to handle local packages
  transpilePackages: [
    '@b2b/ui-components',
    '@b2b/auth',
    '@b2b/nxt-layouts',
    '@b2b/nxt-store',
  ],
  // Ensure output is configured correctly
  output: 'standalone',
};

module.exports = nextConfig;