'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import type { Product } from '@autolounge/shared';
import {
  ROUTES,
  SHIPPING,
  discountPercent,
  effectivePrice,
  formatToman,
  getFeaturedProducts,
  toEnglishDigits,
  toPersianDigits,
} from '@autolounge/shared';
import { RollingNumber } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';
import { ProductCard } from '@/components/molecules/product-card';
import { useRequireAuth } from '@/components/auth/login-sheet';
import { useValidateCoupon } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useCart, useCartStore, type CartItem } from '@/lib/store/cart-store';
import { useHydrated } from '@/lib/store/hydration';
import { cn } from '@/lib/utils';

const MAX_QTY = 50;

/* ------------------------------------------------------------------ */
/* Line item                                                           */
/* ------------------------------------------------------------------ */

function QuantityStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-border bg-background" role="group" aria-label="تعداد">
      <button
        type="button"
        aria-label="کاهش تعداد"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-s-xl transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-bold tabular-nums" aria-live="polite">
        {toPersianDigits(String(value))}
      </span>
      <button
        type="button"
        aria-label="افزایش تعداد"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-e-xl transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function CartLine({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  onQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  const { product, quantity } = item;
  const unit = effectivePrice(product);
  const percent = discountPercent(product);
  const href = `${ROUTES.PRODUCTS}/${product.id}`;
  const max = Math.min(MAX_QTY, product.stock > 0 ? product.stock : MAX_QTY);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 48, transition: { duration: 0.2 } }}
      className="glass-effect flex gap-3 rounded-2xl p-3"
    >
      <Link
        href={href}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
        aria-label={product.name}
      >
        {product.images[0] && (
          <Image src={product.images[0]} alt="" fill sizes="96px" className="object-cover" />
        )}
        {percent > 0 && (
          <span className="absolute start-1 top-1 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
            ٪{toPersianDigits(String(percent))}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
            <Link href={href} className="line-clamp-2 text-sm font-semibold leading-6 hover:text-secondary">
              {product.name}
            </Link>
          </div>
          <IconButton
            label={`حذف ${product.name}`}
            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="-me-2 -mt-1 text-muted-foreground hover:text-destructive"
          />
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold">{formatToman(unit)}</span>
          {percent > 0 && (
            <span className="text-xs text-muted-foreground line-through">{formatToman(product.price)}</span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <QuantityStepper value={quantity} max={max} onChange={onQuantity} />
          <div className="text-end">
            <p className="text-[11px] text-muted-foreground">جمع</p>
            <p className="text-sm font-black text-secondary">{formatToman(unit * quantity)}</p>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Coupon                                                              */
/* ------------------------------------------------------------------ */

function CouponBox({ subtotal }: { subtotal: number }) {
  const { couponCode, setCoupon } = useCart();
  const validate = useValidateCoupon();
  const [code, setCode] = useState(couponCode ?? '');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = async () => {
    const normalized = toEnglishDigits(code).trim().toUpperCase();
    if (!normalized) return;
    setMessage(null);
    try {
      const r = await validate.mutateAsync({ code: normalized, subtotal });
      if (r.valid) {
        setCoupon(r.code ?? normalized);
        setCode(r.code ?? normalized);
        setMessage({ ok: true, text: r.message ?? `تخفیف ${formatToman(r.discount)} اعمال شد` });
        showToast.success('کد تخفیف اعمال شد', formatToman(r.discount));
      } else {
        setCoupon(null);
        setMessage({ ok: false, text: r.message ?? 'کد تخفیف نامعتبر است' });
      }
    } catch (e) {
      setCoupon(null);
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'بررسی کد ناموفق بود' });
    }
  };

  const remove = () => {
    setCoupon(null);
    setCode('');
    setMessage(null);
  };

  return (
    <div className="glass-effect rounded-2xl p-4">
      <div className="flex items-end gap-2">
        <Input
          id="coupon-code"
          label="کد تخفیف"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void apply();
            }
          }}
          placeholder="مثلاً WELCOME10"
          dir="ltr"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="font-mono uppercase tracking-widest"
          startIcon={<Tag className="h-5 w-5" aria-hidden="true" />}
          containerClassName="flex-1"
          disabled={!!couponCode}
        />
        {couponCode ? (
          <Button variant="outline" size="lg" onClick={remove} aria-label="حذف کد تخفیف">
            <X className="h-4 w-4" aria-hidden="true" />
            حذف
          </Button>
        ) : (
          <Button size="lg" onClick={apply} loading={validate.isPending} disabled={!code.trim()}>
            اعمال
          </Button>
        )}
      </div>
      {(message || couponCode) && (
        <p
          role="status"
          className={cn(
            'mt-2 flex items-center gap-1 text-xs',
            (message?.ok ?? true) ? 'text-success' : 'text-destructive'
          )}
        >
          {(message?.ok ?? true) && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          {message?.text ?? `کد ${couponCode} فعال است`}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Totals                                                              */
/* ------------------------------------------------------------------ */

function Row({ label, value, muted }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 text-sm', muted && 'text-muted-foreground')}>
      <dt>{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function TotalsCard({ totals }: { totals: ReturnType<typeof useCart>['totals'] }) {
  const reduced = useReducedMotion();
  const remaining = Math.max(0, SHIPPING.freeThreshold - totals.subtotal);
  const progress = Math.min(100, Math.round((totals.subtotal / SHIPPING.freeThreshold) * 100));

  return (
    <div className="glass-effect-strong rounded-2xl p-5">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium">
            <Truck className="h-4 w-4 text-secondary" aria-hidden="true" />
            {remaining > 0 ? `${formatToman(remaining)} تا ارسال رایگان` : 'ارسال رایگان فعال شد'}
          </span>
          <span className="text-muted-foreground">{toPersianDigits(String(progress))}٪</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="پیشرفت تا ارسال رایگان">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-secondary to-secondary/70"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <dl className="space-y-2.5">
        <Row label={`قیمت کالاها (${toPersianDigits(String(totals.count))} عدد)`} value={formatToman(totals.listTotal)} />
        {totals.productDiscount > 0 && (
          <Row label="تخفیف محصولات" value={<span className="text-success">− {formatToman(totals.productDiscount)}</span>} />
        )}
        {totals.couponDiscount > 0 && (
          <Row
            label="کد تخفیف"
            value={<span className="text-success">− {formatToman(totals.couponDiscount)}</span>}
          />
        )}
        <Row
          label="هزینهٔ ارسال"
          value={totals.shipping === 0 ? <span className="text-success">رایگان</span> : formatToman(totals.shipping)}
        />
        <div className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-3">
          <dt className="font-bold">مبلغ قابل پرداخت</dt>
          <dd className="text-xl font-black text-secondary">
            <RollingNumber value={totals.total} />
            <span className="ms-1 text-sm font-medium text-foreground">تومان</span>
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">زمان تحویل تقریبی: {SHIPPING.estimate}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty & skeleton                                                    */
/* ------------------------------------------------------------------ */

function EmptyCart({ featured }: { featured: Product[] }) {
  const { addItem } = useCart();
  return (
    <div className="container-custom pb-16">
      <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10 text-secondary"
        >
          <ShoppingBag className="h-12 w-12" aria-hidden="true" />
        </motion.div>
        <h1 className="text-2xl font-black">سبد خرید شما خالی است</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          محصولات حرفه‌ای دیتیلینگ و نگهداری خودرو را ببینید یا برای خدمات حضوری نوبت بگیرید.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href={ROUTES.PRODUCTS}>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              مشاهدهٔ محصولات
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={ROUTES.BOOKING}>
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              رزرو خدمات
            </Link>
          </Button>
        </div>
      </div>

      {featured.length > 0 && (
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">پیشنهاد اتولانژ</h2>
            <Link href={ROUTES.PRODUCTS} className="flex items-center gap-1 text-sm text-secondary hover:underline">
              همهٔ محصولات
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={(product) => addItem(product)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="container-custom pb-16" aria-busy="true" aria-label="در حال بارگذاری سبد خرید">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[136px] rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 space-y-4 lg:mt-0">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function CartPageClient() {
  const router = useRouter();
  const hydrated = useHydrated(useCartStore);
  const { items, totals, updateQuantity, removeItem, addItem } = useCart();
  const ensureAuth = useRequireAuth();
  const featured = useMemo(() => getFeaturedProducts(4), []);

  const handleRemove = (item: CartItem) => {
    removeItem(item.product.id);
    toast(`«${item.product.name}» از سبد حذف شد`, {
      action: {
        label: 'بازگردانی',
        onClick: () => addItem(item.product, item.quantity),
      },
    });
  };

  const goCheckout = () => {
    if (ensureAuth(ROUTES.CHECKOUT)) router.push(ROUTES.CHECKOUT);
  };

  if (!hydrated) return <CartSkeleton />;
  if (items.length === 0) return <EmptyCart featured={featured} />;

  return (
    <div className="container-custom pb-28 lg:pb-16">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">سبد خرید</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {toPersianDigits(String(totals.count))} کالا در سبد شما
          </p>
        </div>
        <Link href={ROUTES.PRODUCTS} className="hidden items-center gap-1 text-sm text-secondary hover:underline sm:flex">
          ادامهٔ خرید
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
        <section aria-label="اقلام سبد">
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartLine
                  key={item.product.id}
                  item={item}
                  onQuantity={(qty) => updateQuantity(item.product.id, qty)}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </AnimatePresence>
          </ul>
          <Button variant="ghost" className="mt-4 sm:hidden" asChild>
            <Link href={ROUTES.PRODUCTS}>
              ادامهٔ خرید
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>

        <aside className="mt-6 space-y-4 lg:sticky lg:top-24 lg:mt-0">
          <CouponBox subtotal={totals.subtotal} />
          <TotalsCard totals={totals} />
          <Button size="xl" className="hidden w-full lg:flex" onClick={goCheckout}>
            ادامه به تسویه‌حساب
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </aside>
      </div>

      {/* mobile sticky total bar (above the tab bar) */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 lg:hidden">
        <div className="glass-effect-strong border-t border-border/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">مبلغ قابل پرداخت</p>
              <p className="text-lg font-black leading-tight text-secondary">
                <RollingNumber value={totals.total} />
                <span className="ms-1 text-xs font-medium text-foreground">تومان</span>
              </p>
            </div>
            <Button size="lg" className="min-w-[160px]" onClick={goCheckout}>
              ادامه به تسویه‌حساب
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
