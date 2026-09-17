/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/~offline',
  },
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
let apiHost = null;
try {
  apiHost = new URL(apiUrl);
} catch {
  apiHost = null;
}

// The standalone bundle is traced with symlinks, which Windows refuses unless Developer
// Mode is enabled. Docker and CI (Linux) always produce it; set NEXT_STANDALONE to override.
const standalone =
  process.env.NEXT_STANDALONE === 'true' ||
  (process.env.NEXT_STANDALONE !== 'false' && process.platform !== 'win32');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@autolounge/shared'],
  ...(standalone ? { output: 'standalone' } : {}),
  devIndicators: false,
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 70, 75, 82, 90],
    deviceSizes: [375, 640, 828, 1080, 1200, 1440, 1920],
    remotePatterns: apiHost
      ? [
          {
            protocol: apiHost.protocol.replace(':', ''),
            hostname: apiHost.hostname,
            port: apiHost.port,
            pathname: '/**',
          },
        ]
      : [],
  },
};

module.exports = withPWA(nextConfig);
