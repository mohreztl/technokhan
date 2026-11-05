import type { Metadata } from 'next';
import { ROUTES } from '@technokhan/shared';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { TrackPageClient } from './client';

export const metadata: Metadata = {
  title: 'پیگیری سفارش | تکنو خان',
  description:
    'وضعیت سفارش یا نوبت خود را با کد پیگیری و شمارهٔ موبایل دنبال کنید — بدون نیاز به ورود به حساب کاربری.',
  alternates: { canonical: ROUTES.TRACK },
  openGraph: {
    title: 'پیگیری سفارش | تکنو خان',
    description: 'کد پیگیری و شمارهٔ موبایل را وارد کنید تا وضعیت سفارش یا نوبتتان را ببینید.',
  },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  // Read on the server rather than with useSearchParams(), which would force the
  // whole page to bail out to client rendering and take the no-JS form with it.
  const { code } = await searchParams;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'خانه', href: ROUTES.HOME },
          { name: 'پیگیری سفارش', href: ROUTES.TRACK },
        ])}
      />
      <TrackPageClient initialCode={code?.trim() ?? ''} />
    </>
  );
}
