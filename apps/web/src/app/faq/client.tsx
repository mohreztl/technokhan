'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, MessageCircle, Search, Sparkles, X } from 'lucide-react';
import { ROUTES, toPersianDigits } from '@autolounge/shared';
import type { FaqItem } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { FaqAccordion } from '@/components/catalog/faq-accordion';
import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import type { FaqGroup } from './page';

/** Case-insensitive match against both halves of a question. */
function matches(item: FaqItem, needle: string): boolean {
  if (!needle) return true;
  const hay = `${item.question} ${item.answer}`.toLowerCase();
  return hay.includes(needle.toLowerCase());
}

export function FaqPageClient({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');

  const filtered = React.useMemo(() => {
    const term = query.trim();
    return groups
      .filter((g) => category === 'all' || g.category === category)
      .map((g) => ({ ...g, items: g.items.filter((i) => matches(i, term)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, category, query]);

  const total = filtered.reduce((sum, g) => sum + g.items.length, 0);
  const searching = query.trim().length > 0;

  return (
    <div className="container-custom py-8 lg:py-12">
      <SectionHeading
        eyebrow="پشتیبانی"
        title="سؤالات متداول"
        subtitle="پیش از رزرو یا خرید، احتمالاً پاسخ شما همین‌جاست. اگر نبود، یک پیام کافی است."
        className="mb-8"
      />

      {/* Search */}
      <div className="mx-auto mb-6 max-w-2xl">
        <label htmlFor="faq-search" className="sr-only">
          جست‌وجو در سؤالات
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute inset-s-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً: دوام سرامیک، لغو نوبت، هزینهٔ ارسال…"
            className="h-14 w-full rounded-2xl border border-border bg-card ps-12 pe-12 text-base text-foreground shadow-xs placeholder:text-muted-foreground focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="پاک کردن جست‌وجو"
              className="absolute inset-e-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p role="status" aria-live="polite" className="mt-2 text-center text-xs text-muted-foreground">
          {searching
            ? total > 0
              ? `${toPersianDigits(total)} پاسخ پیدا شد`
              : 'پاسخی با این عبارت پیدا نشد'
            : `${toPersianDigits(groups.reduce((s, g) => s + g.items.length, 0))} پرسش و پاسخ`}
        </p>
      </div>

      {/* Category chips */}
      <nav aria-label="دسته‌بندی سؤالات" className="hide-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        <CategoryChip label="همه" active={category === 'all'} onClick={() => setCategory('all')} />
        {groups.map((g) => (
          <CategoryChip
            key={g.category}
            label={g.category}
            active={category === g.category}
            onClick={() => setCategory(g.category)}
          />
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary" aria-hidden="true">
            <HelpCircle className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-black text-foreground">پاسخی برای «{query}» پیدا نشد</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
            شاید با عبارت دیگری نتیجه بگیرید. اگر هم پرسش شما تازه است، خوشحال می‌شویم مستقیم بپرسید.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setQuery('')}>
              پاک کردن جست‌وجو
            </Button>
            <Button asChild>
              <Link href={ROUTES.CONTACT}>
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                پرسیدن از پشتیبانی
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig.once}
          className="space-y-8"
        >
          {filtered.map((group) => (
            <motion.section key={group.category} variants={fadeInUp} aria-labelledby={`faq-${group.serviceId ?? group.category}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2
                  id={`faq-${group.serviceId ?? group.category}`}
                  className="flex items-center gap-2 text-lg font-black text-foreground"
                >
                  <span aria-hidden="true" className="h-5 w-1 rounded-full bg-linear-to-b from-primary to-secondary" />
                  {group.category}
                </h2>
                {group.serviceId && (
                  <Link
                    href={`${ROUTES.SERVICES}/${group.serviceId}`}
                    className="link-hover inline-flex min-h-10 shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
                  >
                    صفحهٔ خدمت
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
              {/* Searching opens the first hit; browsing leaves everything closed. */}
              <FaqAccordion items={group.items} defaultOpen={searching ? group.items[0]?.id : undefined} />
            </motion.section>
          ))}
        </motion.div>
      )}

      {/* Still stuck */}
      <section className="mt-12 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-center text-white sm:px-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary" aria-hidden="true">
          <Sparkles className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-black text-balance sm:text-2xl">پاسخ پرسش‌تان را پیدا نکردید؟</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/75">
          کارشناسان ما در ساعات کاری پاسخ‌گو هستند و مشاورهٔ پیش از رزرو رایگان است.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link href={ROUTES.CONTACT}>
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              تماس با ما
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href={ROUTES.BOOKING}>رزرو نوبت</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-secondary/60'
      )}
    >
      {label}
    </button>
  );
}
