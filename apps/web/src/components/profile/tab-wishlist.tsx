'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@technokhan/shared';
import { ROUTES, findProduct, toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/molecules/product-card';
import { useCart } from '@/lib/store/cart-store';
import { useHydrated } from '@/lib/store/hydration';
import { useWishlist, useWishlistStore } from '@/lib/store/wishlist-store';

const PREVIEW = 4;

export function TabWishlist() {
  const hydrated = useHydrated(useWishlistStore);
  const { ids, count } = useWishlist();
  const { addItem } = useCart();

  const products = useMemo(
    () => ids.map((id) => findProduct(id)).filter((p): p is Product => !!p),
    [ids]
  );
  const preview = products.slice(0, PREVIEW);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">علاقه‌مندی‌ها</h2>
          {hydrated && count > 0 && (
            <p className="text-xs text-muted-foreground">{toPersianDigits(String(count))} محصول</p>
          )}
        </div>
        {hydrated && count > PREVIEW && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.WISHLIST}>
              مشاهدهٔ همه
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>

      {!hydrated ? (
        <div className="grid grid-cols-2 gap-3" aria-busy="true" aria-label="در حال بارگذاری">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : preview.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <Heart className="h-12 w-12 text-secondary" aria-hidden="true" />
          <div>
            <p className="font-bold">لیست علاقه‌مندی‌ها خالی است</p>
            <p className="mt-1 text-sm text-muted-foreground">محصولات مورد علاقه‌تان را با قلب ذخیره کنید.</p>
          </div>
          <Button size="lg" asChild>
            <Link href={ROUTES.PRODUCTS}>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              مشاهدهٔ محصولات
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {preview.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={(p) => addItem(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
