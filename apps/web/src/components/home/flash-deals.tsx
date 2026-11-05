'use client';

import * as React from 'react';
import { Clock3 } from 'lucide-react';
import { toPersianDigits, type Product } from '@technokhan/shared';
import { getCountdown } from '@/lib/countdown';
import { ProductCard } from '@/components/storefront/product-card';

/** Scroll-snap flash-deal rail with a live countdown and honest stock progress. */
export function FlashDeals({ products }: { products: Product[] }) {
  const deals = React.useMemo(() => products.filter((product) => product.discountPrice).sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0)).slice(0, 5), [products]);
  const target = deals.find((product) => product.dealEndsAt)?.dealEndsAt ?? '2026-11-20T20:30:00.000Z';
  const [now, setNow] = React.useState(0);
  React.useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const countdown = getCountdown(target, now);
  const units = [{ label: 'روز', value: countdown.days }, { label: 'ساعت', value: countdown.hours }, { label: 'دقیقه', value: countdown.minutes }, { label: 'ثانیه', value: countdown.seconds }];
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Clock3 className="size-5" aria-hidden="true" /></span><div><h2 className="font-black">پیشنهادهای شگفت‌انگیز تکنو</h2><p className="mt-1 text-xs text-muted-foreground">قیمت‌های محدود، با موجودی واقعی</p></div></div>
        <div className="flex gap-2" aria-label="زمان باقی‌مانده پیشنهادها">
          {units.map((unit) => <div key={unit.label} className="min-w-14 rounded-xl bg-muted px-2 py-1.5 text-center"><span className="block text-lg font-black tabular-nums">{now === 0 ? '—' : toPersianDigits(String(unit.value).padStart(2, '0'))}</span><span className="block text-[10px] text-muted-foreground">{unit.label}</span></div>)}
        </div>
      </div>
      <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {deals.map((product) => (
          <div key={product.id} className="w-[82vw] shrink-0 snap-start sm:w-[45%] lg:w-[31%] xl:w-[23%]">
            <ProductCard product={product} />
            <div className="mt-2 rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex justify-between text-[11px] text-muted-foreground"><span>موجودی باقی‌مانده</span><span className="tabular-nums">{toPersianDigits(product.stock)} عدد</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`موجودی ${product.name}`} aria-valuenow={Math.min(100, product.stock * 5)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, product.stock * 5)}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
