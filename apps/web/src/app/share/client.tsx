'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Search, Share2, ShoppingBag, Wrench } from 'lucide-react';
import { ROUTES } from '@autolounge/shared';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';

function safeUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Web Share Target landing (`/share?title=&text=&url=` from the PWA manifest). */
export function SharePageClient() {
  const searchParams = useSearchParams();
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const title = searchParams.get('title')?.trim() || '';
  const text = searchParams.get('text')?.trim() || '';
  const url = safeUrl(searchParams.get('url')?.trim() || searchParams.get('text')?.trim() || null);
  const hasContent = Boolean(title || text || url);

  return (
    <div className="container-custom flex min-h-[60dvh] flex-col justify-center py-10 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg"
      >
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
            <Share2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">اشتراک‌گذاری با اتولانژ</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {hasContent ? 'این محتوا با اتولانژ به اشتراک گذاشته شد.' : 'محتوایی برای نمایش ارسال نشده است.'}
          </p>
        </div>

        {hasContent && (
          <div className="rounded-2xl border border-border bg-card p-5" dir="auto">
            {title && <p className="text-base font-bold text-foreground">{title}</p>}
            {text && text !== url && <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{text}</p>}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-10 max-w-full items-center gap-1.5 truncate text-sm text-primary underline-offset-4 hover:underline"
                dir="ltr"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{url}</span>
              </a>
            )}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Button type="button" variant="primary" size="lg" onClick={() => setSearchOpen(true)} className="min-h-12 w-full gap-2 shadow-glow-primary">
            <Search className="h-5 w-5" aria-hidden="true" />
            جستجو در اتولانژ
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="min-h-12 gap-2">
              <Link href={ROUTES.PRODUCTS}>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                فروشگاه
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-12 gap-2">
              <Link href={ROUTES.SERVICES}>
                <Wrench className="h-4 w-4" aria-hidden="true" />
                خدمات
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
