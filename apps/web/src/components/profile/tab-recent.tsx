'use client';

import Link from 'next/link';
import { History, ShoppingBag, Trash2 } from 'lucide-react';
import { PRODUCTS } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductGrid } from '@/components/storefront/product-grid';
import { recentProducts, useRecentlyViewed, useRecentlyViewedStore } from '@/lib/store/recently-viewed-store';
import { useHydrated } from '@/lib/store/hydration';

export function TabRecent() {
  const hydrated = useHydrated(useRecentlyViewedStore);
  const { ids, clear } = useRecentlyViewed();
  const products = recentProducts(ids, '', PRODUCTS);

  return (
    <section className="space-y-4" aria-labelledby="recent-title">
      <div className="flex items-center justify-between gap-3">
        <div><h2 id="recent-title" className="text-lg font-bold">بازدیدهای اخیر</h2><p className="mt-1 text-xs text-muted-foreground">محصولات این دستگاه، بدون نیاز به ورود</p></div>
        {products.length > 0 && <Button variant="ghost" size="sm" onClick={clear}><Trash2 className="size-4" aria-hidden="true" />پاک کردن</Button>}
      </div>
      {!hydrated ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div> : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center"><History className="size-12 text-secondary" aria-hidden="true" /><div><p className="font-bold">هنوز محصولی بازدید نکرده‌اید</p><p className="mt-1 text-sm text-muted-foreground">محصولات بازدیدشده برای مقایسه و بازگشت سریع اینجا می‌مانند.</p></div><Button asChild><Link href="/shop"><ShoppingBag className="size-4" aria-hidden="true" />رفتن به فروشگاه</Link></Button></div>
      ) : <ProductGrid products={products} />}
    </section>
  );
}
