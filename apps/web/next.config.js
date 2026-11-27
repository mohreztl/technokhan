const path = require('path');

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
let apiHost = null;
try {
  apiHost = new URL(apiUrl);
} catch {
  apiHost = null;
}

// Uploaded images live on S3-compatible storage (Parspack); allow next/image to serve them.
let s3Host = null;
try {
  s3Host = new URL(process.env.NEXT_PUBLIC_S3_PUBLIC_URL || '');
} catch {
  s3Host = null;
}

// The standalone bundle is traced with symlinks, which Windows refuses unless Developer
// Mode is enabled. Docker and CI (Linux) always produce it; set NEXT_STANDALONE to override.
const standalone =
  process.env.NEXT_STANDALONE === 'true' ||
  (process.env.NEXT_STANDALONE !== 'false' && process.platform !== 'win32');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@technokhan/shared'],
  ...(standalone ? { output: 'standalone' } : {}),
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async redirects() {
    return [
      { source: '/products', destination: '/shop', permanent: true },
      { source: '/products/:slug', destination: '/product/:slug', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 70, 75, 82, 90],
    deviceSizes: [375, 640, 828, 1080, 1200, 1440, 1920],
    remotePatterns: [
      ...(apiHost
        ? [
            {
              protocol: apiHost.protocol.replace(':', ''),
              hostname: apiHost.hostname,
              port: apiHost.port,
              pathname: '/**',
            },
          ]
        : []),
      ...(s3Host
        ? [
            {
              protocol: s3Host.protocol.replace(':', ''),
              hostname: s3Host.hostname,
              port: s3Host.port,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
};

module.exports = nextConfig;
