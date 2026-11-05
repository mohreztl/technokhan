'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackageSearch, Search } from 'lucide-react';
import { effectivePrice, formatToman } from '@technokhan/shared';
import { queryLocalProducts } from '@/lib/data/local-query';
import { PRODUCT_MEDIA } from '@/content/media-assets';
import { useUIStore } from '@/lib/store/ui-store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const popular = ['شارژر گن', 'هدفون', 'پاوربانک', 'کابل کنفی', 'کیبورد'];

/** Instant product command palette opened by the navbar, mobile search and Ctrl/Cmd+K. */
export function SearchModal() {
  const open = useUIStore((state) => state.searchOpen);
  const setOpen = useUIStore((state) => state.setSearchOpen);
  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);
  const results = React.useMemo(() => deferredQuery.trim() ? queryLocalProducts({ search: deferredQuery, limit: 6 }).items : [], [deferredQuery]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!useUIStore.getState().searchOpen);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  const router = useRouter();
  const close = () => { setOpen(false); setQuery(''); };
  const go = (href: string) => { close(); window.setTimeout(() => router.push(href), 0); };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(''); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>جستجوی گجت</DialogTitle>
          <DialogDescription>نام محصول، برند یا مشخصه فنی را بنویسید.</DialogDescription>
        </DialogHeader>
        <Input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثلاً شارژر ۱۰۰ وات" startIcon={<Search />} label={<span className="sr-only">عبارت جستجو</span>} enterKeyHint="search" />
        {query.trim() ? (
          <div className="mt-4" aria-live="polite">
            {results.length > 0 ? (
              <ul className="space-y-2">
                {results.map((product) => {
                  const media = PRODUCT_MEDIA[product.id as keyof typeof PRODUCT_MEDIA];
                  return (
                    <li key={product.id}>
                      <Link href={`/product/${product.id}`} onClick={() => go(`/product/${product.id}`)} className="flex min-h-20 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
                        <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#e3e6e2]"><Image src={product.images[0] ?? media.src} alt="" fill sizes="64px" className="object-cover" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{product.name}</span><span className="mt-1 block text-xs text-muted-foreground tabular-nums">{formatToman(effectivePrice(product))}</span></span>
                        <Badge variant="outline" size="sm">{product.brand}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : <div className="py-8 text-center"><PackageSearch className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" /><p className="text-sm font-semibold">نتیجه‌ای پیدا نشد</p><p className="mt-1 text-xs text-muted-foreground">عبارت کوتاه‌تری مثل «شارژر» یا «Anker» امتحان کنید.</p></div>}
            {results.length > 0 && <Link href={`/shop?search=${encodeURIComponent(query)}`} onClick={() => go(`/shop?search=${encodeURIComponent(query)}`)} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-muted text-sm font-semibold">مشاهده همه نتایج <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" /></Link>}
          </div>
        ) : (
          <div className="mt-5"><p className="mb-3 text-xs font-semibold text-muted-foreground">جستجوهای پیشنهادی</p><div className="flex flex-wrap gap-2">{popular.map((term) => <button key={term} type="button" onClick={() => setQuery(term)} className="min-h-10 rounded-full border border-border px-4 text-sm hover:bg-muted">{term}</button>)}</div></div>
        )}
      </DialogContent>
    </Dialog>
  );
}
