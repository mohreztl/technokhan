/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@autolounge/shared'],
  output: 'standalone',
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['fa'],
    defaultLocale: 'fa',
  },
};

module.exports = withPWA(nextConfig);
