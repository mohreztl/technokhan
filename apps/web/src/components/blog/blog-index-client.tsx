'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { ARTICLE_CATEGORIES, type Article } from '@technokhan/shared';
import { ArticleCard } from './article-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Searchable and category-filtered magazine index with real Persian editorial content. */
export function BlogIndexClient({ articles }: { articles: Article[] }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string | null>(null);
  const filtered = React.useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fa');
    return articles.filter((article) => (!category || article.category === category) && (!needle || `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLocaleLowerCase('fa').includes(needle)));
  }, [articles, category, query]);
  return (
    <div className="container-custom py-8 sm:py-12">
      <header className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div><Badge variant="original">مجله تکنو خان</Badge><h1 className="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl">برای انتخاب دقیق‌تر، ابتدا بخوانید.</h1><p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">راهنماهای فنی و تجربه‌های واقعی خرید گجت؛ بدون شعار تبلیغاتی و پیچیدگی غیرضروری.</p></div>
        <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} label="جستجو در مجله" placeholder="مثلاً پاوربانک یا نویزکنسلینگ" startIcon={<Search />} />
      </header>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="دسته‌بندی مقالات">
        <Button variant={category === null ? 'primary' : 'outline'} size="sm" onClick={() => setCategory(null)}>همه</Button>
        {ARTICLE_CATEGORIES.map((item) => <Button key={item} variant={category === item ? 'primary' : 'outline'} size="sm" onClick={() => setCategory(item)}>{item}</Button>)}
      </div>
      {filtered.length > 0 ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((article, index) => <ArticleCard key={article.slug} article={article} priority={index < 2} featured={article.featured} />)}</div> : <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center"><h2 className="text-xl font-black">مقاله‌ای پیدا نشد</h2><p className="mt-2 text-sm text-muted-foreground">دسته یا عبارت جستجو را تغییر دهید.</p><Button variant="outline" className={cn('mt-5')} onClick={() => { setQuery(''); setCategory(null); }}>نمایش همه مقالات</Button></div>}
    </div>
  );
}
