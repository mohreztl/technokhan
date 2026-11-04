'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Eye, GitCompareArrows, Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { discountPercent, effectivePrice, toPersianDigits, type Product } from '@autolounge/shared';
import { PRODUCT_MEDIA } from '@/content/media-assets';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useCompare } from '@/lib/store/compare-store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  layout?: 'grid' | 'list';
  onQuickView?: (product: Product) => void;
  className?: string;
}

/** Interactive catalog card with persistent cart, wishlist, compare and quick-view actions. */
export const ProductCard = React.memo(function ProductCard({ product, priority = false, layout = 'grid', onQuickView, className }: ProductCardProps) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const media = PRODUCT_MEDIA[product.id as keyof typeof PRODUCT_MEDIA];
  const percent = discountPercent(product);
  const wished = wishlist.has(product.id);
  const compared = compare.has(product.id);
  const image = product.images[0] ?? media?.src ?? '/images/placeholder-product.webp';

  const add = () => {
    addItem(product);
    toast.success('به سبد خرید اضافه شد', { description: product.name });
  };

  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-luxury', layout === 'list' && 'sm:grid sm:grid-cols-[220px_1fr]', className)}>
      <div className="relative aspect-square overflow-hidden bg-[#e3e6e2]">
        <Link href={`/product/${product.id}`} aria-label={`مشاهده ${product.name}`} className="relative block h-full w-full">
          <Image src={image} alt={media?.alt ?? product.name} fill priority={priority} sizes={layout === 'list' ? '(max-width: 640px) 50vw, 220px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </Link>
        <div className="absolute inset-s-3 top-3 flex flex-col items-start gap-2">
          {percent > 0 && <Badge variant="deal">{toPersianDigits(percent)}٪ تخفیف</Badge>}
          {product.stock === 0 ? <Badge variant="muted">ناموجود</Badge> : product.stock <= 5 ? <Badge variant="warning">تنها {toPersianDigits(product.stock)} عدد</Badge> : null}
        </div>
        <div className="absolute inset-e-3 top-3 flex gap-2">
          <Button size="icon-sm" variant="glass" aria-label={wished ? `حذف ${product.name} از علاقه‌مندی‌ها` : `افزودن ${product.name} به علاقه‌مندی‌ها`} aria-pressed={wished} onClick={() => wishlist.toggle(product.id)}><Heart className={cn('size-4', wished && 'fill-accent text-accent')} aria-hidden="true" /></Button>
          <Button size="icon-sm" variant="glass" aria-label={compared ? `حذف ${product.name} از مقایسه` : `افزودن ${product.name} به مقایسه`} aria-pressed={compared} onClick={() => {
            const selected = compare.toggle(product.id);
            if (!selected && !compared && compare.isFull) toast.error('امکان مقایسه هم‌زمان بیش از ۴ محصول نیست');
          }}><GitCompareArrows className="size-4" aria-hidden="true" /></Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span dir="ltr">{product.brand}</span>
          {product.editorChoice && <Badge variant="original" size="sm"><Check className="size-3" aria-hidden="true" /> منتخب سردبیر</Badge>}
        </div>
        <h3 className="line-clamp-2 min-h-12 text-sm font-bold leading-6 text-foreground sm:text-base">
          <Link href={`/product/${product.id}`} className="transition-colors hover:text-secondary">{product.name}</Link>
        </h3>
        <div className="mt-2"><RatingStars value={product.rating ?? 0} count={product.reviewCount} size="sm" showValue={false} /></div>
        <div className="mt-auto pt-4"><PriceTag price={effectivePrice(product)} originalPrice={product.discountPrice ? product.price : undefined} size="sm" /></div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" size="sm" disabled={product.stock === 0} onClick={add}><ShoppingBag className="size-4" aria-hidden="true" />{product.stock === 0 ? 'ناموجود' : 'افزودن'}</Button>
          {onQuickView && <Button size="icon" variant="outline" aria-label={`مشاهده سریع ${product.name}`} onClick={() => onQuickView(product)}><Eye className="size-4" aria-hidden="true" /></Button>}
        </div>
      </div>
    </article>
  );
});
