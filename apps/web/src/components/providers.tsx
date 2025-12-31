'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/lib/store/cart-store';
import { AuthProvider } from '@/lib/store/auth-store';
import { CartDrawer } from '@/components/organisms/cart-drawer';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Brand colors context for easy access throughout the app
interface BrandColorsContextType {
  colors: {
    navy: string;
    gold: string;
    navyRgb: string;
    goldRgb: string;
  };
}

const BrandColorsContext = createContext<BrandColorsContextType>({
  colors: {
    navy: '#001F3F',
    gold: '#C2B280',
    navyRgb: '0, 31, 63',
    goldRgb: '194, 178, 128',
  },
});

export const useBrandColors = () => useContext(BrandColorsContext);

// Enhanced theme hook with brand colors
export const useTheme = () => {
  const nextTheme = useNextTheme();
  const brandColors = useBrandColors();

  return {
    ...nextTheme,
    brandColors: brandColors.colors,
  };
};

// Main providers wrapper
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const brandColors = {
    navy: '#001F3F',
    gold: '#C2B280',
    navyRgb: '0, 31, 63',
    goldRgb: '194, 178, 128',
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
      themes={['light', 'dark']}
    >
      <QueryProvider>
        <BrandColorsContext.Provider value={{ colors: brandColors }}>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <ErrorBoundary>
                  {/* Prevent flash of unstyled content */}
                  {!mounted ? (
                    <div className="flex items-center justify-center min-h-screen bg-background">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      {children}
                      <CartDrawer />
                      <Toaster />
                    </>
                  )}
                </ErrorBoundary>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </BrandColorsContext.Provider>
      </QueryProvider>
    </NextThemesProvider>
  );
}
