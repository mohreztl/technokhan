'use client';

import * as React from 'react';
import { Laptop, Smartphone, Headphones, Gamepad2, WandSparkles } from 'lucide-react';
import { ProductCategory, type Product } from '@autolounge/shared';
import { ProductGrid } from '@/components/storefront/product-grid';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const devices = [
  { id: 'phone', label: 'موبایل', icon: Smartphone, categories: [ProductCategory.CHARGERS, ProductCategory.POWERBANKS, ProductCategory.CABLES] },
  { id: 'laptop', label: 'لپ‌تاپ', icon: Laptop, categories: [ProductCategory.CABLES, ProductCategory.GAMING, ProductCategory.CHARGERS] },
  { id: 'audio', label: 'صدا و موسیقی', icon: Headphones, categories: [ProductCategory.HEADPHONES] },
  { id: 'gaming', label: 'میز کار و بازی', icon: Gamepad2, categories: [ProductCategory.GAMING] },
] as const;

type DeviceId = (typeof devices)[number]['id'];

/** Interactive budget-and-device recommender computed from the same catalog as the shop. */
export function GadgetFinder({ products }: { products: Product[] }) {
  const [device, setDevice] = React.useState<DeviceId>('phone');
  const [budget, setBudget] = React.useState(8_000_000);
  const selected = devices.find((item) => item.id === device)!;
  const recommendations = React.useMemo(() => products.filter((product) => selected.categories.some((category) => category === product.category) && (product.discountPrice ?? product.price) <= budget && product.stock > 0).sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0)).slice(0, 3), [budget, products, selected.categories]);
  return (
    <div className="rounded-3xl border border-border bg-foreground p-5 text-background sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
        <div>
          <WandSparkles className="mb-5 size-7 text-[#c8f45a]" aria-hidden="true" />
          <h2 className="text-2xl font-black">راهنمای هوشمند انتخاب گجت</h2>
          <p className="mt-3 text-sm leading-7 text-background/65">دستگاه و بودجه را انتخاب کنید؛ پیشنهادها از همان کاتالوگ واقعی و بدون رفرش صفحه به‌روز می‌شوند.</p>
          <div className="mt-6 grid grid-cols-2 gap-2" role="group" aria-label="نوع دستگاه">
            {devices.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)} className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold', device === id ? 'border-[#c8f45a] bg-[#c8f45a] text-[#111315]' : 'border-background/20 text-background/75')}><Icon className="size-4" aria-hidden="true" />{label}</button>)}
          </div>
          <Select label="سقف بودجه" value={String(budget)} onChange={(event) => setBudget(Number(event.target.value))} className="mt-5 border-background/25 bg-background/10 text-background" options={[{ value: '2000000', label: 'تا ۲ میلیون تومان' }, { value: '5000000', label: 'تا ۵ میلیون تومان' }, { value: '8000000', label: 'تا ۸ میلیون تومان' }, { value: '15000000', label: 'تا ۱۵ میلیون تومان' }, { value: '100000000', label: 'بودجه آزاد' }]} />
        </div>
        <div>
          {recommendations.length > 0 ? <ProductGrid products={recommendations} className="grid-cols-1 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3" /> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-background/25 p-6 text-center"><p className="font-bold">در این بودجه پیشنهادی نداریم</p><p className="mt-2 text-sm text-background/60">بودجه را افزایش دهید یا نوع دستگاه را تغییر دهید.</p><Button variant="secondary" className="mt-5" onClick={() => setBudget(100_000_000)}>نمایش بودجه آزاد</Button></div>}
        </div>
      </div>
    </div>
  );
}
