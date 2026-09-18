'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle } from 'lucide-react';
import { ROUTES, toPersianDigits } from '@autolounge/shared';
import type { Article, ArticleCategory } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { ArticleCard } from '@/components/blog/article-card';
import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

export function BlogIndexClient({
  articles,
  categories,
}: {
  articles: Article[];
  categories: ArticleCategory[];
}) {
  const [category, setCategory] = React.useState<ArticleCategory | 'all'>('all');

  const visible = React.useMemo(
    () => (category === 'all' ? articles : articles.filter((a) => a.category === category)),
    [articles, category]
  );

  // The lead story is the newest piece overall, not the newest in the filter —
  // switching categories should not shuffle the page's whole shape.
  const [lead, ...rest] = category === 'all' ? visible : [undefined, ...visible];

  return (
    <div className="container-custom py-8 lg:py-12">
      <SectionHeading
        eyebrow="مجله"
        title="دانش مراقبت از خودرو"
        subtitle="آنچه در کارگاه یاد گرفته‌ایم، به زبان ساده. بدون تبلیغ، با جزئیاتی که واقعاً به کار می‌آید."
        className="mb-8"
      />

      <nav aria-label="دسته‌بندی مقاله‌ها" className="hide-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        <CategoryChip label="همه" active={category === 'all'} onClick={() => setCategory('all')} />
        {categories.map((c) => (
          <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary" aria-hidden="true">
            <BookOpen className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-black text-foreground">هنوز مقاله‌ای در این دسته نداریم</h2>
          <p className="mt-2 text-sm text-muted-foreground">به‌زودی اینجا را پر می‌کنیم.</p>
          <Button variant="outline" className="mt-6" onClick={() => setCategory('all')}>
            دیدن همهٔ مقاله‌ها
          </Button>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          {lead && (
            <motion.div variants={fadeInUp}>
              <ArticleCard article={lead} featured />
            </motion.div>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.filter(Boolean).map((a) => (
              <motion.div key={a!.slug} variants={fadeInUp}>
                <ArticleCard article={a!} className="h-full" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {`${toPersianDigits(visible.length)} مقاله`}
      </p>

      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig.once}
        className="mt-12 rounded-3xl border border-border bg-card px-6 py-10 text-center sm:px-10"
      >
        <h2 className="text-xl font-black text-foreground text-balance">سؤالی دارید که اینجا پاسخش نیست؟</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
          پرتکرارترین پرسش‌ها را در صفحهٔ سؤالات متداول جمع کرده‌ایم؛ برای باقی‌اش یک پیام کافی است.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href={ROUTES.FAQ}>سؤالات متداول</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.CONTACT}>
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              تماس با ما
            </Link>
          </Button>
        </div>
      </motion.section>
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
