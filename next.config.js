/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  pageExtensions: ['jsx', 'js', 'tsx', 'ts'],
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;
