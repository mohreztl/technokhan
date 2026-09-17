import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Car, Home, Package, Wrench } from 'lucide-react';
import { ROUTES } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { SearchShortcut } from '@/components/pages/search-shortcut';

export const metadata: Metadata = {
  title: 'صفحه یافت نشد',
  description: 'صفحهٔ مورد نظر شما یافت نشد.',
  robots: { index: false, follow: false },
};

const SUGGESTED_PAGES = [
  { title: 'فروشگاه', description: 'محصولات دیتیلینگ و مراقبت از خودرو', href: ROUTES.PRODUCTS, icon: Package },
  { title: 'خدمات', description: 'سرامیک، احیای رنگ، PPF و دیتیلینگ', href: ROUTES.SERVICES, icon: Wrench },
  { title: 'رزرو نوبت', description: 'رزرو آنلاین در چند ثانیه', href: ROUTES.BOOKING, icon: Car },
];

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-9rem)] items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="relative mb-6">
          <div className="select-none text-[120px] font-black leading-none text-muted/20 sm:text-[200px]" aria-hidden="true">
            ۴۰۴
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 motion-safe:animate-pulse">
              <Car className="h-14 w-14 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>

        <h1 className="mb-3 text-balance text-2xl font-black text-foreground sm:text-4xl">صفحهٔ مورد نظر یافت نشد!</h1>
        <p className="mx-auto mb-8 max-w-md text-balance text-sm leading-7 text-muted-foreground sm:text-lg">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>

        <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" size="lg" className="min-h-12 gap-2">
            <Link href={ROUTES.HOME}>
              <Home className="h-4 w-4" aria-hidden="true" />
              صفحهٔ اصلی
            </Link>
          </Button>
          <SearchShortcut size="lg" className="min-h-12 gap-2" />
        </div>

        <div className="border-t border-border pt-8">
          <h2 className="mb-5 text-base font-bold text-foreground">شاید این صفحات مفید باشند:</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {SUGGESTED_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group flex min-h-[4.5rem] items-start gap-3 rounded-xl bg-muted/50 p-4 text-start transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <page.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 font-bold text-foreground transition-colors group-hover:text-primary">
                    {page.title}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 rtl:rotate-180" aria-hidden="true" />
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">{page.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
