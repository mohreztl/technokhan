import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/**
 * Flat config: Next 16 removed `next lint`, so the app is linted with the
 * ESLint CLI. eslint-config-next 16 ships flat configs natively, so this
 * spreads them straight in — no FlatCompat.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'next-env.d.ts',
      'postcss.config.js',
      // written by @serwist/next at build time
      'public/sw.js',
      'public/swe-worker-*.js',
    ],
  },
  ...nextCoreWebVitals,
  {
    /*
     * eslint-config-next 16 turns on the React Compiler hook rules, which this
     * codebase has never been checked against: they report 64 findings across
     * 32 files. They are kept visible as warnings rather than silenced, but
     * they do not block the build yet.
     *
     * `set-state-in-effect` in particular fires on the SSR-safe pattern this
     * app uses everywhere — read localStorage in an effect, never during
     * render — so a blanket fix would be a rewrite, not a cleanup. Clearing
     * these is its own piece of work, file by file, with each flow exercised.
     */
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
];

export default config;
