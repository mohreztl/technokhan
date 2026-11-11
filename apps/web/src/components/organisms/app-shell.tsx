'use client';

import dynamic from 'next/dynamic';
import { CartDrawer } from '@/components/organisms/cart-drawer';
import { MobileTabBar } from '@/components/organisms/mobile-tab-bar';
import { Toaster } from '@/components/ui/toaster';
import { DemoBanner } from '@/components/organisms/demo-banner';
import { LoginSheet } from '@/components/auth/login-sheet';
import { NotificationSheet, NotificationSync } from '@/components/organisms/notification-center';

const SearchModal = dynamic(() => import('./search-modal').then((module) => module.SearchModal), { ssr: false });

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
