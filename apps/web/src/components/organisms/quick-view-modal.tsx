'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Minus, Package, Plus, Shield, ShoppingCart, Star, Truck } from 'lucide-react';
import {
  ROUTES,
  discountPercent,
  effectivePrice,
  formatToman,
  toPersianDigits,
  type Product,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { showToast } from '@/components/ui/toaster';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useUIStore } from '@/lib/store/ui-store';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: Truck, text: 'ارسال سریع' },
  { icon: Shield, text: 'ضمانت اصالت' },
  { icon: Package, text: 'بسته‌بندی ایمن' },
];

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const imgRef = useRef<HTMLDivElement>(null);

  // Reset per product / open
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [isOpen, product?.id]);

  if (!product) return null;

  const inStock = product.stock > 0;
  const price = effectivePrice(product);
  const percent = discountPercent(product);
  const wished = wishlist.has(product.id);
  const images = product.images.length > 0 ? product.images : [];

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    const src = images[selectedImage] ?? images[0];
    const el = imgRef.current;
    if (src && el) {
      const rect = el.getBoundingClientRect();
      useUIStore
        .getState()
        .fly({ src, from: { x: rect.left, y: rect.top, width: rect.width, height: rect.height } });
    }
    showToast.addedToCart(product.name);
    onClose();
  };

  const handleToggleWishlist = () => {
    const added = wishlist.toggle(product.id);
    if (added) showToast.addedToWishlist(product.name);
    else showToast.info('از علاقه‌مندی‌ها حذف شد', product.name);
  };

  const actions = (
    <div className="flex w-full items-stretch gap-2">
      <Button
        variant="secondary"
        className="h-12 flex-1 gap-2 rounded-xl shadow-glow-secondary"
        onClick={handleAddToCart}
        disabled={!inStock}
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        {inStock ? 'افزودن به سبد خرید' : 'ناموجود'}
      </Button>
      <IconButton
        label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        icon={<Heart className={cn(wished && 'fill-current')} />}
        variant="outline"
        size="lg"
        active={wished}
        onClick={handleToggleWishlist}
        className={cn('rounded-xl', wished && 'border-red-500 bg-red-500/10 text-red-500')}
      />
    </div>
  );

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={product.name}
      description={product.brand}
      snapPoints={[0.92]}
      footer={actions}
      hideHeader
      desktopClassName="max-w-4xl p-0 overflow-hidden"
      contentClassName="px-4"
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-0">
        {/* Gallery */}
        <div className="relative md:bg-muted md:p-6">
          {percent > 0 && (
            <span className="absolute inset-s-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white md:inset-s-8 md:top-8">
              {toPersianDigits(percent)}٪ تخفیف
            </span>
          )}
          <div
            ref={imgRef}
            className="relative aspect-square overflow-hidden rounded-2xl bg-muted md:bg-background"
          >
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-contain"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="تصاویر محصول">
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  role="tab"
                  aria-selected={selectedImage === index}
                  aria-label={`تصویر ${toPersianDigits(index + 1)}`}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors',
                    selectedImage === index
                      ? 'border-primary dark:border-secondary'
                      : 'border-transparent hover:border-muted-foreground/50'
                  )}
                >
                  <Image src={image} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col md:p-6 md:pe-12">
          {product.brand && (
            <span className="mb-2 self-start rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-semibold text-foreground">
              {product.brand}
            </span>
          )}
          <h2 className="mb-2 text-xl font-bold text-foreground md:text-2xl">{product.name}</h2>

          {product.rating ? (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.round(product.rating ?? 0)
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </span>
              <span className="text-muted-foreground">
                {toPersianDigits(product.rating)} ({toPersianDigits(product.reviewCount ?? 0)} نظر)
              </span>
            </div>
          ) : null}

          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-black text-primary dark:text-secondary tabular-nums md:text-3xl">
              {formatToman(price)}
            </span>
            {percent > 0 && (
              <span className="text-base text-muted-foreground line-through tabular-nums">
                {formatToman(product.price)}
              </span>
            )}
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm">
            <span
              className={cn('h-2 w-2 rounded-full', inStock ? 'bg-success' : 'bg-destructive')}
              aria-hidden="true"
            />
            <span className={inStock ? 'text-success' : 'text-destructive'}>
              {inStock ? `موجود در انبار (${toPersianDigits(product.stock)} عدد)` : 'ناموجود'}
            </span>
          </div>

          {inStock && (
            <div className="mb-5 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">تعداد:</span>
              <div
                className="flex items-center rounded-xl border border-border/50 bg-muted/40"
                role="group"
                aria-label="تعداد"
              >
                <IconButton
                  label="کاهش تعداد"
                  icon={<Minus />}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                />
                <span className="w-10 text-center font-bold tabular-nums" aria-live="polite">
                  {toPersianDigits(quantity)}
                </span>
                <IconButton
                  label="افزایش تعداد"
                  icon={<Plus />}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                />
              </div>
            </div>
          )}

          {/* Desktop actions live inline; on mobile they are the pinned sheet footer */}
          <div className="mb-5 hidden lg:block">{actions}</div>

          <ul className="mb-5 grid grid-cols-3 gap-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li
                  key={f.text}
                  className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center text-[11px] text-muted-foreground"
                >
                  <Icon className="h-5 w-5 text-primary dark:text-secondary" aria-hidden="true" />
                  {f.text}
                </li>
              );
            })}
          </ul>

          <Link
            href={`${ROUTES.PRODUCTS}/${product.id}`}
            onClick={onClose}
            className="flex min-h-[44px] items-center justify-center gap-2 text-sm font-medium text-primary hover:underline dark:text-secondary"
          >
            مشاهده جزئیات کامل
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
