'use client';

import * as React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Truck } from 'lucide-react';
import { BRANDS, type Article, type Product } from '@technokhan/shared';
import { HeroShowcase } from './hero-showcase';
import { BentoCategories } from './bento-categories';
import { FlashDeals } from './flash-deals';
import { GadgetFinder } from './gadget-finder';
import { SectionHeader } from '@/components/storefront/section-header';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ArticleCard } from '@/components/blog/article-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export interface HomePageProps {
  products: Product[];
  articles: Article[];
}

/** Complete TechnoKhan landing page composed from reusable storefront sections. */
export function HomePage({ products, articles }: HomePageProps) {
  const popular = [...products].sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0)).slice(0, 4);
  const newest = [...products].sort((a, b) => Date.parse(b.createdAt as string) - Date.parse(a.createdAt as string)).slice(0, 4);
  const editors = products.filter((product) => product.editorChoice).slice(0, 4);
  return (
    <>
      <div className="container-custom pt-5 sm:pt-8"><HeroShowcase /></div>
      <div className="container-custom grid gap-3 py-6 sm:grid-cols-3">
        <Badge variant="outline" className="justify-center rounded-xl px-4 py-3"><ShieldCheck className="size-4 text-secondary" aria-hidden="true" /> اورجینال با فاکتور رسمی</Badge>
        <Badge variant="outline" className="justify-center rounded-xl px-4 py-3"><Truck className="size-4 text-secondary" aria-hidden="true" /> ارسال سریع و بسته‌بندی امن</Badge>
        <Badge variant="outline" className="justify-center rounded-xl px-4 py-3"><Award className="size-4 text-secondary" aria-hidden="true" /> ارزیابی تخصصی پیش از عرضه</Badge>
      </div>
      <section className="container-custom py-10"><SectionHeader title="دنیای گجت، دسته‌بندی‌شده برای انتخاب سریع" description="از شارژ و صدا تا میز کار؛ هر دسته با محصولات منتخب و مشخصات روشن." href="/shop" /><BentoCategories /></section>
      <section className="container-custom py-10"><FlashDeals products={products} /></section>
      <section className="container-custom py-10">
        <SectionHeader title="محصولاتی که انتخاب کاربران و سردبیرند" description="ویترین زنده فروشگاه؛ بدون رفرش صفحه بین فهرست‌ها جابه‌جا شوید." href="/shop" />
        <Tabs defaultValue="popular">
          <TabsList label="ویترین محصولات منتخب"><TabsTrigger value="popular">پرفروش‌ترین‌ها</TabsTrigger><TabsTrigger value="newest">جدیدترین گجت‌ها</TabsTrigger><TabsTrigger value="editors">منتخب سردبیر</TabsTrigger></TabsList>
          <TabsContent value="popular"><ProductGrid products={popular} /></TabsContent>
          <TabsContent value="newest"><ProductGrid products={newest} /></TabsContent>
          <TabsContent value="editors"><ProductGrid products={editors} /></TabsContent>
        </Tabs>
      </section>
      <section className="container-custom py-10">
        <SectionHeader title="برندهای اورجینال، انتخاب بدون حدس" description="محصولات با منشأ مشخص، گارانتی قابل بررسی و تجهیزات سازگار." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {BRANDS.map((brand) => <Link key={brand.id} href={`/shop?brands=${brand.name}`} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-secondary/60"><span className="text-lg font-black" dir="ltr">{brand.name}</span><span className="mt-1 text-xs text-muted-foreground">{brand.nameFa}</span></Link>)}
        </div>
      </section>
      <section className="container-custom py-10"><GadgetFinder products={products} /></section>
      <section className="container-custom py-10 pb-16"><SectionHeader title="مجله تکنو خان" description="راهنماهای کوتاه و کاربردی برای خرید دقیق‌تر و استفاده بهتر از تجهیزات." href="/blog" linkLabel="همه مقالات" /><div className="grid gap-5 md:grid-cols-3">{articles.slice(0, 3).map((article) => <ArticleCard key={article.slug} article={article} />)}</div></section>
    </>
  );
}
