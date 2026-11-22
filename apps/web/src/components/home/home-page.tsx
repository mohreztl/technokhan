import Link from 'next/link';
import { Award, ShieldCheck, Truck } from 'lucide-react';
import { BRANDS, type Article, type Product } from '@technokhan/shared';
import { HeroShowcase } from './hero-showcase';
import { HomeProductTabs } from './home-product-tabs';
import { BentoCategories } from './bento-categories';
import { FlashDeals } from './flash-deals';
import { GadgetFinder } from './gadget-finder';
import { SectionHeader } from '@/components/storefront/section-header';
import { ArticleCard } from '@/components/blog/article-card';

export interface HomePageProps {
  products: Product[];
  articles: Article[];
}

/** Complete TechnoKhan landing page composed from reusable storefront sections. */
export function HomePage({ products, articles }: HomePageProps) {
  return (
    <>
      <HeroShowcase />
      <div className="border-b border-border bg-card/60">
        <div className="container-custom grid gap-1 py-3 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-border">
          <span className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-secondary" aria-hidden="true" /> اورجینال با فاکتور رسمی</span>
          <span className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold"><Truck className="size-4 text-secondary" aria-hidden="true" /> ارسال سریع و بسته‌بندی امن</span>
          <span className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold"><Award className="size-4 text-secondary" aria-hidden="true" /> ارزیابی تخصصی پیش از عرضه</span>
        </div>
      </div>
      <section className="container-custom py-10"><SectionHeader title="دنیای گجت، دسته‌بندی‌شده برای انتخاب سریع" description="از شارژ و صدا تا میز کار؛ هر دسته با محصولات منتخب و مشخصات روشن." href="/categories" /><BentoCategories /></section>
      <section className="container-custom py-10"><FlashDeals products={products} /></section>
      <section className="container-custom py-10">
        <SectionHeader title="محصولاتی که انتخاب کاربران و سردبیرند" description="ویترین زنده فروشگاه؛ بدون رفرش صفحه بین فهرست‌ها جابه‌جا شوید." href="/shop" />
        <HomeProductTabs products={products} />
      </section>
      <section className="container-custom py-10">
        <SectionHeader title="برندهای اورجینال، انتخاب بدون حدس" description="محصولات با منشأ مشخص، گارانتی قابل بررسی و تجهیزات سازگار." href="/brands" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {BRANDS.map((brand) => <Link key={brand.id} href={`/shop?brands=${brand.name}`} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-secondary/60"><span className="text-lg font-black" dir="ltr">{brand.name}</span><span className="mt-1 text-xs text-muted-foreground">{brand.nameFa}</span></Link>)}
        </div>
      </section>
      <section className="container-custom py-10"><GadgetFinder products={products} /></section>
      <section className="container-custom py-10 pb-16"><SectionHeader title="مجله تکنو خان" description="راهنماهای کوتاه و کاربردی برای خرید دقیق‌تر و استفاده بهتر از تجهیزات." href="/blog" linkLabel="همه مقالات" /><div className="grid gap-5 md:grid-cols-3">{articles.slice(0, 3).map((article) => <ArticleCard key={article.slug} article={article} />)}</div></section>
    </>
  );
}
