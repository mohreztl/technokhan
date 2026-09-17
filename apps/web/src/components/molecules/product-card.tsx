'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Eye, Heart, Package, ShoppingCart, Sparkles, Star } from 'lucide-react';
import {
  ROUTES,
  discountPercent,
  effectivePrice,
  formatToman,
  toPersianDigits,
  type Product,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useIsCoarsePointer } from '@/lib/hooks/use-media-query';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useUIStore } from '@/lib/store/ui-store';
import { showToast } from '@/components/ui/toaster';
import { IconButton } from '@/components/ui/icon-button';
import { QuickViewModal } from '@/components/organisms/quick-view-modal';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

/** Sends the product image flying towards the cart target (layer built in components/creative). */
export function flyToCart(product: Product, imgEl: HTMLElement | null) {
  const src = product.images[0];
  if (!src || !imgEl) return;
  const rect = imgEl.getBoundingClientRect();
  useUIStore.getState().fly({
    src,
    from: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
  });
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, className }) => {
  const prefersReducedMotion = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const tiltEnabled = !prefersReducedMotion && !coarse;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 25 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['4deg', '-4deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-4deg', '4deg']);

  const inStock = product.stock > 0;
  const price = effectivePrice(product);
  const percent = discountPercent(product);
  const href = `${ROUTES.PRODUCTS}/${product.id}`;
  const wished = wishlist.has(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product);
    flyToCart(product, imgRef.current);
    showToast.addedToCart(product.name);
    onAddToCart?.(product);
  };

  const handleToggleWishlist = () => {
    const added = wishlist.toggle(product.id);
    if (added) showToast.addedToWishlist(product.name);
    else showToast.info('از علاقه‌مندی‌ها حذف شد', product.name);
  };

  return (
    <>
      <div style={{ perspective: '1000px' }} className={cn('h-full', className)}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={tiltEnabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
          className={cn(
            'group relative flex h-full flex-col overflow-hidden rounded-2xl',
            'border border-border/50 bg-gradient-to-br from-card/80 via-card to-card/90',
            'shadow-lg transition-[border-color,box-shadow] duration-500 hover:border-secondary/40 hover:shadow-2xl hover:shadow-primary/10'
          )}
        >
          {/* Media */}
          <div ref={imgRef} className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
            <Link href={href} className="absolute inset-0 block" aria-label={product.name} tabIndex={-1}>
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={cn(
                    'object-cover transition-transform duration-700 group-hover:scale-105',
                    !inStock && 'grayscale'
                  )}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
                </span>
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Link>

            {/* Badges */}
            <div className="pointer-events-none absolute start-3 top-3 flex flex-col gap-2">
              {percent > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {toPersianDigits(percent)}٪ تخفیف
                </span>
              )}
              {product.featured && percent === 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/80 px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-lg shadow-primary/30">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  پیشنهادی
                </span>
              )}
            </div>

            {/* Quick actions: always visible on touch layouts, hover-revealed on desktop */}
            <div
              className={cn(
                'absolute end-3 top-3 flex flex-col gap-2 transition-opacity duration-300',
                'lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100'
              )}
            >
              <IconButton
                label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                icon={<Heart className={cn(wished && 'fill-current')} />}
                variant="glass"
                active={wished}
                onClick={handleToggleWishlist}
                className={cn(
                  'bg-background/70 text-foreground shadow-md',
                  wished && 'bg-red-500 text-white hover:bg-red-500/90'
                )}
              />
              <IconButton
                label="مشاهده سریع"
                icon={<Eye />}
                variant="glass"
                onClick={() => setShowQuickView(true)}
                className="bg-background/70 text-foreground shadow-md"
              />
            </div>

            {!inStock && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                <span className="rounded-xl border border-white/15 bg-black/60 px-5 py-2 text-base font-bold text-white">
                  ناموجود
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="relative flex flex-1 flex-col p-4 sm:p-5">
            <span
              aria-hidden="true"
              className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"
            />

            {product.rating ? (
              <div className="mb-2 flex items-center gap-1.5 text-xs">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" aria-hidden="true" />
                <span className="font-semibold text-foreground">{toPersianDigits(product.rating)}</span>
                {product.reviewCount ? (
                  <span className="text-muted-foreground">
                    ({toPersianDigits(product.reviewCount)} نظر)
                  </span>
                ) : null}
              </div>
            ) : null}

            <Link href={href} className="group/title outline-none focus-visible:underline">
              <h3 className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover/title:text-primary">
                {product.name}
              </h3>
              {product.brand ? (
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{product.brand}</p>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-muted-foreground" dir="ltr">
                  {product.nameEn}
                </p>
              )}
            </Link>

            <p className="mb-4 mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription ?? product.description}
            </p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-4">
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-lg font-black text-foreground tabular-nums">
                  {formatToman(price)}
                </span>
                {percent > 0 && (
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {formatToman(product.price)}
                  </span>
                )}
              </div>

              <IconButton
                label={inStock ? `افزودن ${product.name} به سبد خرید` : 'ناموجود'}
                icon={<ShoppingCart />}
                variant="primary"
                disabled={!inStock}
                onClick={handleAddToCart}
                className="rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};
