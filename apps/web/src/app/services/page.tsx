import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import { FAQ, ROUTES, SERVICES, SERVICE_TYPE_LABELS } from '@autolounge/shared';
import { getServices } from '@/lib/data/repository';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { SectionHeading } from '@/components/ui/premium-components';
import { ServiceGridSkeleton } from '@/components/molecules/loading-skeletons';
import { ServiceList } from '@/components/catalog/service-list';
import { QuoteCalculator } from '@/components/catalog/quote-calculator';
import { FaqAccordion } from '@/components/catalog/faq-accordion';
import { buildServiceQuery, parseServiceType } from '@/components/catalog/service-query';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'گارانتی کتبی' },
  { icon: Award, label: 'متخصصان دارای مدرک' },
  { icon: Sparkles, label: 'بیمهٔ خدمات' },
];

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const type = parseServiceType((await searchParams).type);
  const label = type ? SERVICE_TYPE_LABELS[type] : undefined;
  const title = label ? `خدمات ${label}` : 'خدمات تخصصی مراقبت از خودرو';
  const description = label
    ? `${label} در اتولانژ با مواد اورجینال، متخصصان دارای مدرک و گارانتی کتبی؛ قیمت شفاف بر اساس اندازهٔ خودرو و رزرو آنلاین.`
    : 'سرامیک بدنه، احیای رنگ، دیتیلینگ کامل، رپ خودرو، PPF و صفرشویی داخل با گارانتی کتبی؛ قیمت شفاف و رزرو آنلاین در اتولانژ.';
  return {
    title,
    description,
    alternates: { canonical: type ? `${ROUTES.SERVICES}?type=${type}` : ROUTES.SERVICES },
    openGraph: { title, description },
  };
}

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const type = parseServiceType((await searchParams).type);
  const { data } = await getServices(buildServiceQuery(type));
  const serviceFaq = FAQ.filter((item) => item.category === 'خدمات');

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'خانه', href: ROUTES.HOME },
          { name: 'خدمات', href: ROUTES.SERVICES },
          ...(type ? [{ name: SERVICE_TYPE_LABELS[type] ?? type, href: `${ROUTES.SERVICES}?type=${type}` }] : []),
        ])}
      />

      {/* Hero band */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground" aria-labelledby="services-hero-title">
        <Image
          src="/images/workshop.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/60" />
        <div className="container-custom relative py-14 text-center lg:py-24">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-secondary">خدمات اتولانژ</p>
          <h1 id="services-hero-title" className="mx-auto max-w-3xl text-balance text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            مراقبت حرفه‌ای از خودرو، با استاندارد جهانی
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-7 text-primary-foreground/80 sm:text-base">
            از سرامیک و PPF تا احیای رنگ و دیتیلینگ کامل؛ هر خدمت با مواد اورجینال و توسط تکنسین‌های دارای مدرک اجرا می‌شود.
          </p>
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="container-custom py-10 lg:py-16">
            <ServiceGridSkeleton count={6} />
          </div>
        }
      >
        <ServiceList initialType={type} initialData={data} />
      </Suspense>

      {/* Quote configurator */}
      <section id="quote" className="scroll-mt-24 bg-muted/40 py-16 lg:py-24" aria-labelledby="quote-title">
        <div className="container-custom">
          <SectionHeading
            id="quote-title"
            eyebrow="برآورد قیمت"
            title="قیمت خدمات خود را حساب کنید"
            subtitle="خدمت، اندازهٔ خودرو و خدمات تکمیلی را انتخاب کنید؛ قیمت نهایی و زمان اجرا همان‌جا نمایش داده می‌شود."
          />
          <div className="mx-auto max-w-4xl">
            <QuoteCalculator services={SERVICES} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      {serviceFaq.length > 0 && (
        <section className="py-16 lg:py-24" aria-labelledby="services-faq-title">
          <div className="container-custom max-w-3xl">
            <SectionHeading
              id="services-faq-title"
              eyebrow="سؤالات متداول"
              title="پرسش‌های رایج دربارهٔ خدمات"
            />
            <FaqAccordion items={serviceFaq} />
          </div>
        </section>
      )}
    </>
  );
}
