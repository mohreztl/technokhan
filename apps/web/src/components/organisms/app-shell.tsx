'use client';

import { CartDrawer } from '@/components/organisms/cart-drawer';
import { MobileTabBar } from '@/components/organisms/mobile-tab-bar';
import { SearchModal } from '@/components/organisms/search-modal';
import { Toaster } from '@/components/ui/toaster';
import { DemoBanner } from '@/components/organisms/demo-banner';
import { LoginSheet } from '@/components/auth/login-sheet';
import { NotificationSheet, NotificationSync } from '@/components/organisms/notification-center';

/** Global overlays, mobile navigation, search, cart and account feedback. */
export function AppShell() {
  return (
    <>
      <MobileTabBar />
      <CartDrawer />
      <SearchModal />
      <LoginSheet />
      <NotificationSync />
      <NotificationSheet />
      <DemoBanner />
      <Toaster />
    </>
  );
}
