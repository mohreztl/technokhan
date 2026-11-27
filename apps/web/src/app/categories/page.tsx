import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getStoreCategories } from '@/lib/data/repository';
import { breadcrumbJsonLd, JsonLd } from '@/lib/seo';

const PLACEHOLDER = '/images/placeholder-product.webp';

export const metadata: Metadata = {
  title: 'دسته‌بندی محصولات',
  description: 'مشاهده همه دسته‌بندی‌های گجت و لوازم جانبی دیجیتال؛ از کابل و شارژر و هدفون تا قاب، هولدر و ساعت هوشمند.',
  alternates: { canonical: '/categories' },
  openGraph: { title: 'دسته‌بندی محصولات تکنو خان', description: 'گجت موردنظر را از دسته‌بندی مشخص و محصولات منتخب پیدا کنید.', url: '/categories' },
};

export default async function CategoriesPage() {
  const categories = await getStoreCategories();

  return (
    <div className="container-custom py-7 sm:py-10">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'دسته‌بندی‌ها' }]} />
      <header className="grid gap-5 border-b border-border py-8 sm:py-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"><LayoutGrid className="size-4" aria-hidden="true" /> راهنمای فروشگاه</span>
          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-black leading-tight sm:text-5xl">هر گجت، جای مشخص خودش را دارد.</h1>
        </div>
        <p className="max-w-xl text-sm leading-8 text-muted-foreground lg:justify-self-end">دسته موردنظر را انتخاب کنید تا محصولات همان گروه را با فیلتر برند، قیمت و ویژگی فنی مرور کنید.</p>
      </header>

      <section aria-labelledby="category-list-title" className="py-8 sm:py-10">
        <h2 id="category-list-title" className="sr-only">همه دسته‌بندی‌ها</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${encodeURIComponent(category.slug)}`} className="group relative min-h-72 overflow-hidden rounded-3xl border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <Image src={category.image ?? PLACEHOLDER} alt={category.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#090b0cf5] via-[#090b0c55] to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                <span>
                  <span className="block text-xl font-black">{category.name}</span>
                  <span className="mt-2 block text-xs leading-6 text-white/70">{category.description}</span>
                  <span className="mt-3 block text-xs font-semibold text-[#c8f45a]">{toPersianDigits(category.productCount)} محصول</span>
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm"><ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd([{ name: 'خانه', href: '/' }, { name: 'دسته‌بندی‌ها', href: '/categories' }])} />
    </div>
  );
}
