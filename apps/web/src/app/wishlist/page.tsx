import type { Metadata } from 'next';
import { ROUTES } from '@autolounge/shared';
import { WishlistPageClient } from './client';

export const metadata: Metadata = {
  title: 'علاقه‌مندی‌ها',
  description: 'محصولاتی که برای بعد ذخیره کرده‌اید.',
  alternates: { canonical: ROUTES.WISHLIST },
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
