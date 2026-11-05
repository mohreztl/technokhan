import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, PackageSearch, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'صفحه یافت نشد', robots: { index: false, follow: false } };

/** Branded 404 page with clear next actions instead of an empty error state. */
export default function NotFound() {
  return (
    <div className="container-custom flex min-h-[65dvh] flex-col items-center justify-center py-14 text-center">
      <span className="flex size-24 items-center justify-center rounded-3xl border border-border bg-card"><SearchX className="size-10 text-secondary" aria-hidden="true" /></span>
      <p className="mt-6 text-sm font-bold text-secondary">خطای ۴۰۴</p>
      <h1 className="mt-2 text-balance text-3xl font-black sm:text-4xl">این صفحه در فروشگاه وجود ندارد.</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">ممکن است آدرس تغییر کرده یا محصول جدیدی با این نام نباشد. از فروشگاه یا جستجو ادامه دهید.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild size="lg"><Link href="/"><Home className="size-4" aria-hidden="true" /> صفحه اصلی</Link></Button><Button asChild size="lg" variant="outline"><Link href="/shop"><PackageSearch className="size-4" aria-hidden="true" /> مشاهده فروشگاه</Link></Button></div>
    </div>
  );
}
