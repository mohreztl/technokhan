'use client';

import { CartDrawer } from '@/components/organisms/cart-drawer';
import { MobileCartPill } from '@/components/organisms/mobile-cart-pill';
import { MobileTabBar } from '@/components/organisms/mobile-tab-bar';
import { CompareBar } from '@/components/organisms/compare-bar';
import { MoreSheet } from '@/components/organisms/more-sheet';
import { SearchModal } from '@/components/organisms/search-modal';
import { Toaster } from '@/components/ui/toaster';
import { DemoBanner } from '@/components/organisms/demo-banner';
import { LoginSheet } from '@/components/auth/login-sheet';
import { FlyToCartLayer } from '@/components/creative/fly-to-cart';
import { NotificationSheet, NotificationSync } from '@/components/organisms/notification-center';

/**
 * Global overlays and the mobile app shell. Everything mounted here lives
 * outside the page tree (drawers, sheets, tab bar, toasts, fly-to-cart layer).
 */
export function AppShell() {
  return (
    <>
      <MobileTabBar />
      <MobileCartPill />
      <CompareBar />
      <CartDrawer />
      <SearchModal />
      <MoreSheet />
      <LoginSheet />
      <NotificationSync />
      <NotificationSheet />
      <FlyToCartLayer />
      <DemoBanner />
      <Toaster />
    </>
  );
}
