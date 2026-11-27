import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Globe2 } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getStoreBrands } from '@/lib/data/repository';
import { breadcrumbJsonLd, JsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'برندهای فروشگاه',
  description: 'مشاهده برندهای گجت و لوازم جانبی در تکنو خان و مرور محصولات سامسونگ، الدی‌انو، ارلدام، هیسکا، مک‌دودو و دیگر برندها.',
  alternates: { canonical: '/brands' },
  openGraph: { title: 'برندهای فروشگاه تکنو خان', description: 'محصولات برند موردنظر را با ضمانت اصالت و مشخصات روشن مرور کنید.', url: '/brands' },
};

export default async function BrandsPage() {
  const brands = await getStoreBrands();

  return (
    <div className="container-custom py-7 sm:py-10">
      <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'برندها' }]} />
      <header className="grid gap-5 border-b border-border py-8 sm:py-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"><BadgeCheck className="size-4" aria-hidden="true" /> انتخاب بر اساس سازنده</span>
          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-black leading-tight sm:text-5xl">از برندی که می‌شناسید شروع کنید.</h1>
        </div>
        <p className="max-w-xl text-sm leading-8 text-muted-foreground lg:justify-self-end">برند را انتخاب کنید تا همه محصولات موجود آن را در فروشگاه ببینید؛ با امکان فیلتر دسته‌بندی، قیمت و امتیاز.</p>
      </header>

      <section aria-labelledby="brand-list-title" className="py-8 sm:py-10">
        <h2 id="brand-list-title" className="sr-only">همه برندها</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brand/${encodeURIComponent(brand.id)}`} className="group flex min-h-56 flex-col justify-between rounded-3xl border border-border bg-card p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Globe2 className="size-4" aria-hidden="true" /> {brand.country || '—'}</span>
                <ArrowLeft className="size-5 text-secondary transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-4xl font-black tracking-tight" dir="ltr">{brand.name}</span>
                <span className="mt-2 block text-sm text-muted-foreground">{brand.nameFa}</span>
                <span className="mt-5 inline-flex rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">{toPersianDigits(brand.productCount)} محصول در فروشگاه</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-muted p-5 sm:flex-row sm:items-center">
        <div><h2 className="font-black">هنوز برند مشخصی در ذهن ندارید؟</h2><p className="mt-1 text-sm text-muted-foreground">از نوع گجت شروع کنید و سپس برندها را مقایسه کنید.</p></div>
        <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-bold text-background">مشاهده دسته‌بندی‌ها <ArrowLeft className="size-4" aria-hidden="true" /></Link>
      </div>
      <JsonLd data={breadcrumbJsonLd([{ name: 'خانه', href: '/' }, { name: 'برندها', href: '/brands' }])} />
    </div>
  );
}
