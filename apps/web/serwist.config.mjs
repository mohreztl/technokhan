import { serwist } from '@serwist/next/config';

/**
 * Serwist in configurator mode: the service worker is built as its own step
 * after `next build`, not by a webpack plugin.
 *
 * Next 16 builds with Turbopack, and @serwist/next's plugin mode only knows
 * how to hook webpack — wrapping the Next config there makes the build refuse
 * to start. Here the worker is a separate command, so it works under either
 * bundler, and `next dev` never produces one (which is what you want: a stale
 * precache is the last thing you need while editing).
 */
export default serwist.withNextConfig((nextConfig) => ({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  globDirectory: nextConfig.distDir ?? '.next',
}));
