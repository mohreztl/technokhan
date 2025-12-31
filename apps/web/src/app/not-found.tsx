import Link from 'next/link';
import { Metadata } from 'next';
import { Home, Search, ArrowRight, Car, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@autolounge/shared';

export const metadata: Metadata = {
  title: 'صفحه یافت نشد | اتولانژ',
  description: 'صفحه مورد نظر شما یافت نشد',
};

const SUGGESTED_PAGES = [
  {
    title: 'محصولات',
    description: 'مشاهده تمام محصولات دیتیلینگ',
    href: ROUTES.PRODUCTS,
    icon: Package,
  },
  {
    title: 'خدمات',
    description: 'رزرو خدمات تخصصی خودرو',
    href: ROUTES.SERVICES,
    icon: Wrench,
  },
  {
    title: 'رزرو نوبت',
    description: 'رزرو آنلاین سرویس',
    href: ROUTES.BOOKING,
    icon: Car,
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-[150px] sm:text-[200px] font-black text-muted/20 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Car className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
          صفحه مورد نظر یافت نشد!
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild variant="primary" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              صفحه اصلی
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/products">
              <Search className="h-4 w-4" />
              جستجوی محصولات
            </Link>
          </Button>
        </div>

        {/* Suggested Pages */}
        <div className="border-t border-border pt-8">
          <h2 className="text-lg font-bold text-foreground mb-6">
            شاید این صفحات مفید باشند:
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {SUGGESTED_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-right"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <page.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {page.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {page.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
