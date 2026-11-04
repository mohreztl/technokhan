'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import {
  ROUTES,
  SHIPPING,
  effectivePrice,
  formatToman,
  toEnglishDigits,
  toPersianDigits,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useCart, type CartItem } from '@/lib/store/cart-store';
import { useValidateCoupon } from '@/lib/hooks/use-orders';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { useBodyScrollLock } from '@/lib/hooks/use-body-scroll-lock';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { BottomSheet, useFocusTrap } from '@/components/ui/bottom-sheet';
import { showToast } from '@/components/ui/toaster';
import { springSheet } from '@/lib/animation-variants';

/* ------------------------------------------------------------------ */
/* Pieces shared by the mobile sheet and the desktop drawer            */
/* ------------------------------------------------------------------ */

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full min-h-72 flex-col items-center justify-center py-10 text-center">
      <div className="relative mb-5">
        <span className="absolute inset-0 rounded-full bg-secondary/20 blur-2xl" aria-hidden="true" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary/15 to-secondary/25 ring-1 ring-secondary/30">
          <ShoppingBag className="h-11 w-11 text-primary dark:text-secondary" aria-hidden="true" />
        </span>
      </div>
      <h3 className="mb-1 text-lg font-bold text-foreground">سبد خرید شما خالی است</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        گجت موردنظر خود را به سبد اضافه کنید تا اینجا ببینید
      </p>
      <Button asChild variant="primary" className="gap-2">
        <Link href="/shop" onClick={onClose}>
          مشاهده محصولات
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function CartLine({
  item,
  onRemove,
  onQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onQuantity: (q: number) => void;
}) {
  const { product, quantity } = item;
  const unit = effectivePrice(product);
  const hasDiscount = unit < product.price;
  const maxQty = product.stock > 0 ? product.stock : 99;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
      transition={springSheet}
      className="flex gap-3 rounded-2xl border border-border/40 bg-card/60 p-3"
    >
      <Link
        href={`/product/${product.id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
        aria-label={product.name}
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {product.name}
            </h4>
            {item.selection && <p className="mt-1 text-[11px] text-muted-foreground">{[item.selection.colorName, item.selection.warrantyTitle].filter(Boolean).join(' · ')}</p>}
          </div>
          <IconButton
            label={`حذف ${product.name}`}
            icon={<Trash2 />}
            size="sm"
            className="-me-2 -mt-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-primary dark:text-secondary tabular-nums">
              {formatToman(unit * quantity)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                {formatToman(product.price * quantity)}
              </span>
            )}
          </div>

          <div
            className="flex items-center rounded-xl border border-border/50 bg-background/60"
            role="group"
            aria-label={`تعداد ${product.name}`}
          >
            <IconButton
              label="کاهش تعداد"
              icon={<Minus />}
              size="sm"
              className="rounded-xl"
              onClick={() => onQuantity(quantity - 1)}
            />
            <span className="w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
              {toPersianDigits(quantity)}
            </span>
            <IconButton
              label="افزایش تعداد"
              icon={<Plus />}
              size="sm"
              className="rounded-xl"
              disabled={quantity >= maxQty}
              onClick={() => onQuantity(quantity + 1)}
            />
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function CouponField() {
  const { couponCode, setCoupon, totals } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const validate = useValidateCoupon();
  const { coupon } = totals;

  useEffect(() => {
    if (!couponCode) setCode('');
  }, [couponCode]);

  // Codes live in the database now, so only the API can say whether one is real.
  const apply = async () => {
    const trimmed = toEnglishDigits(code).trim().toUpperCase();
    if (!trimmed) return;
    setError(null);
    try {
      const r = await validate.mutateAsync({ code: trimmed, subtotal: totals.subtotal });
      if (r.valid) setCoupon(r.code ?? trimmed, r.coupon);
      else {
        setCoupon(null);
        setError(r.message || 'کد تخفیف نامعتبر است');
      }
    } catch (e) {
      setCoupon(null);
      setError(e instanceof Error ? e.message : 'بررسی کد ناموفق بود');
    }
  };

  if (couponCode && coupon.valid) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-sm">
        <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-foreground">
          کد <span className="font-mono font-bold" dir="ltr">{couponCode}</span> اعمال شد
          {coupon.message ? ` · ${coupon.message}` : ''}
        </span>
        <IconButton
          label="حذف کد تخفیف"
          icon={<X />}
          size="sm"
          onClick={() => setCoupon(null)}
        />
      </div>
    );
  }

  return (
    <form
      className="space-y-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        void apply();
      }}
    >
      <div className="flex items-center gap-2">
        <label htmlFor="cart-coupon" className="sr-only">
          کد تخفیف
        </label>
        <div className="relative flex-1">
          <Ticket
            className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="cart-coupon"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="کد تخفیف دارید؟"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            className="h-11 w-full rounded-xl border border-input bg-background/70 ps-9 pe-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="h-11"
          loading={validate.isPending}
          disabled={!code.trim()}
        >
          اعمال
        </Button>
      </div>
      {(error || (couponCode && !coupon.valid && coupon.message)) && (
        <p className="text-xs text-destructive" role="alert">
          {error ?? coupon.message}
        </p>
      )}
    </form>
  );
}

function Totals() {
  const { totals } = useCart();
  const row = 'flex items-center justify-between text-sm';
  return (
    <dl className="space-y-1.5">
      <div className={row}>
        <dt className="text-muted-foreground">جمع کالاها</dt>
        <dd className="tabular-nums">{formatToman(totals.listTotal)}</dd>
      </div>
      {totals.productDiscount > 0 && (
        <div className={row}>
          <dt className="text-muted-foreground">تخفیف محصولات</dt>
          <dd className="text-success tabular-nums">{formatToman(totals.productDiscount)}-</dd>
        </div>
      )}
      {totals.couponDiscount > 0 && (
        <div className={row}>
          <dt className="text-muted-foreground">کد تخفیف</dt>
          <dd className="text-success tabular-nums">{formatToman(totals.couponDiscount)}-</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-muted-foreground">هزینه ارسال</dt>
        <dd className={cn('tabular-nums', totals.shipping === 0 && 'font-semibold text-success')}>
          {totals.shipping === 0 ? 'رایگان' : formatToman(totals.shipping)}
        </dd>
      </div>
      {totals.shipping > 0 && (
        <p className="text-[11px] text-muted-foreground">
          با خرید بالای {formatToman(SHIPPING.freeThreshold)} ارسال رایگان می‌شود
        </p>
      )}
      <div className="flex items-center justify-between border-t border-border/40 pt-2">
        <dt className="font-bold text-foreground">مبلغ قابل پرداخت</dt>
        <dd className="text-lg font-black text-primary dark:text-secondary tabular-nums">
          {formatToman(totals.total)}
        </dd>
      </div>
    </dl>
  );
}

function CartActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="h-12" onClick={onClose}>
        ادامه خرید
      </Button>
      <Button asChild variant="secondary" className="h-12 gap-2 shadow-glow-secondary">
        <Link href={ROUTES.CHECKOUT} onClick={onClose}>
          تسویه حساب
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function CartBody({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity } = useCart();

  if (items.length === 0) return <EmptyCart onClose={onClose} />;

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <CartLine
              key={item.product.id}
              item={item}
              onRemove={() => {
                removeItem(item.product.id);
                showToast.removedFromCart(item.product.name);
              }}
              onQuantity={(q) => updateQuantity(item.product.id, q)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <CouponField />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop drawer                                                      */
/* ------------------------------------------------------------------ */

function DesktopDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, totalItems } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={springSheet}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border/50 bg-background shadow-2xl outline-hidden"
          >
            <div className="flex items-center justify-between border-b border-border/50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-secondary">
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="cart-drawer-title" className="text-lg font-bold text-foreground">
                    سبد خرید
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {toPersianDigits(totalItems)} محصول
                  </p>
                </div>
              </div>
              <IconButton label="بستن سبد خرید" icon={<X />} onClick={onClose} />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              <CartBody onClose={onClose} />
            </div>

            {items.length > 0 && (
              <div className="space-y-4 border-t border-border/50 bg-card p-5">
                <Totals />
                <CartActions onClose={onClose} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

/** Cart overlay: bottom sheet below `lg`, right-anchored drawer above. */
export const CartDrawer: React.FC = () => {
  const { isOpen, closeCart, items, totalItems } = useCart();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <BottomSheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeCart();
        }}
        title="سبد خرید"
        description={
          totalItems > 0 ? `${toPersianDigits(totalItems)} محصول` : 'هنوز چیزی اضافه نکرده‌اید'
        }
        snapPoints={[0.85]}
        footer={
          items.length > 0 ? (
            <div className="space-y-3">
              <Totals />
              <CartActions onClose={closeCart} />
            </div>
          ) : undefined
        }
      >
        <CartBody onClose={closeCart} />
      </BottomSheet>
    );
  }

  return <DesktopDrawer open={isOpen} onClose={closeCart} />;
};
