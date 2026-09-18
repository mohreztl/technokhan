'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { MotionConfig } from 'framer-motion';
import { SerwistProvider } from '@serwist/next/react';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { StoreHydrator } from '@/lib/store/hydration';
import { AppShell } from '@/components/organisms/app-shell';

export const BRAND_COLORS = {
  navy: '#001F3F',
  gold: '#C2B280',
  navyRgb: '0, 31, 63',
  goldRgb: '194, 178, 128',
} as const;

/** Theme hook with brand colors attached (kept for existing consumers). */
export const useTheme = () => {
  const nextTheme = useNextTheme();
  return { ...nextTheme, brandColors: BRAND_COLORS };
};

/** @deprecated brand colors are static; use BRAND_COLORS */
export const useBrandColors = () => ({ colors: BRAND_COLORS });

/**
 * Global providers. Children render on the server too — persisted stores
 * hydrate after mount via <StoreHydrator/>, so there is no loading gate.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      // No worker is built for `next dev`, so registering one there would 404.
      disable={process.env.NODE_ENV === 'development'}
      reloadOnOnline={false}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        themes={['light', 'dark']}
        disableTransitionOnChange
      >
        <QueryProvider>
          <MotionConfig reducedMotion="user">
            <StoreHydrator />
            <ErrorBoundary>
              {children}
              <AppShell />
            </ErrorBoundary>
          </MotionConfig>
        </QueryProvider>
      </NextThemesProvider>
    </SerwistProvider>
  );
}
