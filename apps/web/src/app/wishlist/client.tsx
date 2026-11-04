'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { ROUTES, findProduct, toPersianDigits, type Product } from '@autolounge/shared';
import { useProduct } from '@/lib/hooks/use-products';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist, useWishlistStore } from '@/lib/store/wishlist-store';
import { useHydrated } from '@/lib/store/hydration';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toaster';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductCardSkeleton, ProductGridSkeleton } from '@/components/molecules/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

/** Card for an id that is not part of the bundled catalogue (fetched from the API). */
function RemoteWishlistCard({ id, onResolved }: { id: string; onResolved: (product: Product) => void }) {
  const { data, isError } = useProduct(id);
  const wishlist = useWishlist();

  React.useEffect(() => {
    if (data) onResolved(data);
  }, [data, onResolved]);

  React.useEffect(() => {
    // Product no longer exists: drop it from the list quietly.
    if (isError) wishlist.remove(id);
  }, [isError, id, wishlist]);

  if (!data) return <ProductCardSkeleton />;
  return <ProductCard product={data} className="h-full" />;
}

export function WishlistPageClient() {
  const hydrated = useHydrated(useWishlistStore);
  const wishlist = useWishlist();
  const { addItem } = useCart();
  const [remote, setRemote] = React.useState<Record<string, Product>>({});

  const onResolved = React.useCallback((product: Product) => {
    setRemote((current) => (current[product.id] ? current : { ...current, [product.id]: product }));
  }, []);

  const entries = wishlist.ids.map((id) => ({ id, product: findProduct(id) ?? remote[id] }));
  const resolved = entries.map((e) => e.product).filter((p): p is Product => Boolean(p));
  const purchasable = resolved.filter((p) => p.stock > 0);

  const addAll = () => {
    if (purchasable.length === 0) return;
    purchasable.forEach((product) => addItem(product, 1));
    showToast.success(
      `${toPersianDigits(purchasable.length)} محصول به سبد اضافه شد`,
      purchasable.length < resolved.length ? 'محصولات ناموجود اضافه نشدند.' : undefined
    );
  };

  const clearAll = () => {
    wishlist.clear();
    showToast.info('فهرست علاقه‌مندی‌ها خالی شد');
  };

  if (!hydrated) {
    return (
      <div className="container-custom py-6 lg:py-10" aria-busy="true">
        <Skeleton className="mb-6 h-9 w-48" />
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="container-custom py-6 lg:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-secondary">ذخیره‌شده‌ها</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-foreground sm:text-3xl">
            <Heart className="h-6 w-6 fill-red-500 text-red-500" aria-hidden="true" />
            علاقه‌مندی‌ها
            {wishlist.count > 0 && (
              <span className="text-base font-semibold text-muted-foreground">({toPersianDigits(wishlist.count)})</span>
            )}
          </h1>
        </div>
        {wishlist.count > 0 && (
          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="button" variant="primary" onClick={addAll} disabled={purchasable.length === 0} className="min-h-11 flex-1 gap-2 sm:flex-none">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              افزودن همه به سبد
            </Button>
            <Button type="button" variant="ghost" onClick={clearAll} className="min-h-11 gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              پاک کردن
            </Button>
          </div>
        )}
      </header>

      {wishlist.count === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center"
        >
          <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-red-500/10">
            <Heart className="h-14 w-14 text-red-400" aria-hidden="true" />
            <span aria-hidden="true" className="absolute -inset-e-1 -top-1 h-5 w-5 rounded-full bg-secondary/60" />
            <span aria-hidden="true" className="absolute -inset-s-2 bottom-2 h-3 w-3 rounded-full bg-primary/30" />
          </span>
          <h2 className="mt-6 text-xl font-black text-foreground">هنوز چیزی ذخیره نکرده‌اید</h2>
          <p className="mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
            روی قلب هر محصول بزنید تا این‌جا ذخیره شود و بعداً راحت به سبد اضافه‌اش کنید.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-6 min-h-12 gap-2 px-8">
            <Link href={ROUTES.PRODUCTS}>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              مشاهدهٔ فروشگاه
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {entries.map(({ id, product }) =>
            product ? (
              <ProductCard key={id} product={product} className="h-full" />
            ) : (
              <RemoteWishlistCard key={id} id={id} onResolved={onResolved} />
            )
          )}
        </div>
      )}
    </div>
  );
}
