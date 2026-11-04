'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GitCompareArrows, Trash2, X } from 'lucide-react';
import { effectivePrice, findProduct, formatToman, toPersianDigits } from '@autolounge/shared';
import { useCompare, useCompareStore } from '@/lib/store/compare-store';
import { useHydrated } from '@/lib/store/hydration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/ui/rating-stars';
import { Skeleton } from '@/components/ui/skeleton';

/** Side-by-side comparison of up to four products with the union of technical specifications. */
export function CompareClient() {
  const compare = useCompare();
  const hydrated = useHydrated(useCompareStore);
  const products = compare.ids.map(findProduct).filter((product) => product !== undefined);
  const specificationLabels = [...new Set(products.flatMap((product) => product.specifications?.map((specification) => specification.label) ?? []))];
  if (!hydrated) return <div className="container-custom py-10"><Skeleton className="h-12 w-64" /><Skeleton className="mt-6 h-[480px] rounded-2xl" /></div>;
  if (products.length === 0) return (
    <div className="container-custom py-10"><div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-border p-8 text-center"><GitCompareArrows className="size-12 text-muted-foreground" aria-hidden="true" /><h1 className="mt-5 text-2xl font-black">هنوز محصولی برای مقایسه انتخاب نشده</h1><p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">از کارت محصول یا صفحه جزئیات، تا ۴ گجت را کنار هم قرار دهید و مشخصات واقعی را بسنجید.</p><Button asChild className="mt-6"><Link href="/shop">انتخاب محصول</Link></Button></div></div>
  );
  return (
    <div className="container-custom py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">مقایسه گجت‌ها</h1><p className="mt-2 text-sm text-muted-foreground">{toPersianDigits(products.length)} محصول از حداکثر ۴ محصول</p></div><Button variant="ghost" onClick={compare.clear}><Trash2 className="size-4" aria-hidden="true" /> پاک کردن همه</Button></header>
      <div className="overflow-x-auto rounded-2xl border border-border" tabIndex={0} role="region" aria-label="جدول مقایسه محصولات">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <caption className="sr-only">مقایسه قیمت و مشخصات فنی محصولات انتخاب‌شده</caption>
          <thead><tr className="border-b border-border"><th scope="col" className="w-40 bg-muted/40 p-4 text-start">محصول</th>{products.map((product) => <th key={product.id} scope="col" className="min-w-52 bg-card p-4 align-top"><div className="relative"><Button variant="ghost" size="icon-sm" className="absolute -top-2 -end-2" aria-label={`حذف ${product.name}`} onClick={() => compare.remove(product.id)}><X className="size-4" aria-hidden="true" /></Button><Link href={`/product/${product.id}`} className="relative mx-auto block size-28 overflow-hidden rounded-xl bg-[#e3e6e2]"><Image src={product.images[0]!} alt="" fill sizes="112px" className="object-cover" /></Link><h2 className="mt-3 text-sm font-bold leading-6"><Link href={`/product/${product.id}`}>{product.name}</Link></h2><Badge variant="outline" className="mt-2">{product.brand}</Badge></div></th>)}</tr></thead>
          <tbody>
            <CompareRow label="قیمت">{products.map((product) => <td key={product.id} className="p-4 font-black tabular-nums">{formatToman(effectivePrice(product))}</td>)}</CompareRow>
            <CompareRow label="امتیاز">{products.map((product) => <td key={product.id} className="p-4"><RatingStars value={product.rating ?? 0} showValue={false} size="sm" /></td>)}</CompareRow>
            <CompareRow label="موجودی">{products.map((product) => <td key={product.id} className="p-4"><Badge variant={product.stock > 0 ? 'stock' : 'muted'}>{product.stock > 0 ? `${toPersianDigits(product.stock)} عدد` : 'ناموجود'}</Badge></td>)}</CompareRow>
            {specificationLabels.map((label) => <CompareRow key={label} label={label}>{products.map((product) => <td key={product.id} className="p-4 leading-7 text-muted-foreground">{product.specifications?.find((specification) => specification.label === label)?.value ?? '—'}</td>)}</CompareRow>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <tr className="border-b border-border last:border-0"><th scope="row" className="w-40 bg-muted/40 p-4 text-start align-top font-semibold">{label}</th>{children}</tr>;
}
