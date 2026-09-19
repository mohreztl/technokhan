'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarCheck, Check, Clock, Phone, Plus, ShieldCheck, Star } from 'lucide-react';
import {
  CONTACT,
  ROUTES,
  SERVICE_TYPE_LABELS,
  VEHICLE_SIZES,
  WRAP_COLORS,
  formatToman,
  toPersianDigits,
  type GalleryItem,
  type Service,
  type VehicleSize,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useRelatedServices, useService } from '@/lib/hooks/use-services';
import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/animation-variants';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/ui/premium-components';
import { StickyCtaBar, useStickyCta } from '@/components/molecules/sticky-cta-bar';
import { ServiceCard } from '@/components/molecules/service-card';
import { BeforeAfterSlider } from '@/components/creative/before-after-slider';
import { ProcessTimeline } from '@/components/creative/process-timeline';
import { FaqAccordion } from '@/components/catalog/faq-accordion';
import { QuoteCalculator } from '@/components/catalog/quote-calculator';
import { RatingStars } from '@/components/catalog/rating-stars';
import { ReviewSection } from '@/components/catalog/review-section';
import { ShareButton } from '@/components/catalog/share-button';
import { CompareToggle } from '@/components/catalog/compare-toggle';
import { SnapRow } from '@/components/catalog/snap-row';

const Lightbox = dynamic(() => import('@/components/creative/lightbox').then((m) => m.Lightbox), {
  ssr: false,
});

const WrapVisualizer = dynamic(
  () => import('@/components/creative/wrap-visualizer').then((m) => m.WrapVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 rounded-3xl border border-border bg-card p-4 sm:p-6" aria-busy="true">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    ),
  }
);

export interface ServiceDetailClientProps {
  service: Service;
  related: Service[];
  /** Editorial gallery items linked to this service (may be empty). */
  gallery: GalleryItem[];
}

const PLACEHOLDER = '/images/placeholder-service.webp';

function durationLabel(minutes: number): string {
  const hours = minutes / 60;
  const text = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace('.', '٫');
  return `حدود ${toPersianDigits(text)} ساعت`;
}

const bookingHref = (serviceId: string, size?: VehicleSize) =>
  `${ROUTES.BOOKING}?service=${serviceId}${size ? `&size=${size}` : ''}`;

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  muted,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn('scroll-mt-24 py-12 lg:py-16', muted && 'bg-muted/40', className)}
      aria-labelledby={`${id}-title`}
    >
      <div className="container-custom">
        <SectionHeading id={`${id}-title`} eyebrow={eyebrow} title={title} subtitle={subtitle} align="start" className="mb-6 lg:mb-8" />
        {children}
      </div>
    </section>
  );
}

export function ServiceDetailClient({ service: initial, related: initialRelated, gallery }: ServiceDetailClientProps) {
  const { data } = useService(initial.id, initial);
  const service = data ?? initial;
  const { data: relatedData } = useRelatedServices(service.id, 3, initialRelated);
  const related = relatedData ?? initialRelated;

  const ctaRef = React.useRef<HTMLDivElement>(null);
  const stickyVisible = useStickyCta(ctaRef);

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const typeLabel = SERVICE_TYPE_LABELS[service.type] ?? service.type;
  const startingPrice = service.pricing?.small ?? service.price;
  const reviews = service.reviews ?? [];
  const isWrapLike = service.type === 'car_wrap' || service.type === 'ppf';
  const hero = service.images[0] ?? PLACEHOLDER;

  const galleryItems = React.useMemo<GalleryItem[]>(() => {
    if (gallery.length > 0) return gallery;
    const items: GalleryItem[] = [];
    if (service.beforeAfter) {
      items.push({
        id: `${service.id}-before-after`,
        title: service.beforeAfter.caption ?? service.name,
        serviceType: service.type,
        serviceId: service.id,
        before: service.beforeAfter.before,
        after: service.beforeAfter.after,
        cover: service.beforeAfter.after,
        tags: [typeLabel],
      });
    }
    (service.gallery ?? []).forEach((src, index) => {
      items.push({
        id: `${service.id}-gallery-${index}`,
        title: `${service.name} – نمونهٔ ${toPersianDigits(index + 1)}`,
        serviceType: service.type,
        serviceId: service.id,
        before: src,
        after: src,
        cover: src,
        tags: [typeLabel],
      });
    });
    return items;
  }, [gallery, service, typeLabel]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="pb-8 lg:pb-16">
      {/* Cinematic header */}
      <header className="relative min-h-[420px] overflow-hidden bg-primary text-primary-foreground lg:min-h-[520px]">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-primary via-primary/70 to-primary/20" />
        <div className="container-custom relative flex min-h-[420px] flex-col justify-end pb-8 pt-4 lg:min-h-[520px] lg:pb-14">
          <Breadcrumb
            items={[
              { label: 'خانه', href: ROUTES.HOME },
              { label: 'خدمات', href: ROUTES.SERVICES },
              { label: typeLabel, href: `${ROUTES.SERVICES}?type=${service.type}` },
              { label: service.name },
            ]}
            className="mb-auto [&_a]:text-primary-foreground/70 [&_a:hover]:text-primary-foreground [&_span]:text-primary-foreground"
          />
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
              <Badge variant="gold" size="lg">{typeLabel}</Badge>
              {service.warrantyMonths ? (
                <Badge variant="secondary" size="lg" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  گارانتی {toPersianDigits(service.warrantyMonths)} ماهه
                </Badge>
              ) : null}
            </motion.div>
            <motion.h1 variants={fadeInUp} className="mt-4 text-balance text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {service.name}
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-1 text-sm text-primary-foreground/70" dir="ltr">
              <span className="block text-start">{service.nameEn}</span>
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {service.rating ? (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-secondary text-secondary" aria-hidden="true" />
                  <span className="font-bold tabular-nums">{toPersianDigits(service.rating.toFixed(1))}</span>
                  <span className="text-primary-foreground/70">({toPersianDigits(service.reviewCount ?? reviews.length)} نظر)</span>
                </span>
              ) : null}
              <span className="flex items-center gap-1.5 text-primary-foreground/85">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {durationLabel(service.duration)}
              </span>
            </motion.div>
            <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/85 sm:text-base">
              {service.description}
            </motion.p>
            <motion.div variants={fadeInUp} ref={ctaRef} className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary" size="lg" className="min-h-12 gap-2 px-7 shadow-glow-secondary">
                <Link href={bookingHref(service.id)}>
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  رزرو این خدمت
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg" className="min-h-12 gap-2">
                <a href={`tel:${CONTACT.phoneEn}`}>
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  مشاورهٔ رایگان
                </a>
              </Button>
              <CompareToggle
                service={service}
                variant="button"
                className="min-h-12 border-white/25 bg-white/10 text-primary-foreground hover:bg-white/20 aria-pressed:border-transparent aria-pressed:bg-secondary aria-pressed:text-secondary-foreground"
              />
              <ShareButton
                payload={{ title: service.name, text: service.description }}
                variant="ghost"
                className="h-12 w-12 text-primary-foreground hover:bg-white/10"
              />
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Pricing */}
      <Section id="pricing" eyebrow="تعرفه" title="قیمت بر اساس اندازهٔ خودرو" subtitle="قیمت‌ها شفاف و نهایی هستند؛ خدمات تکمیلی را می‌توانید هنگام رزرو اضافه کنید.">
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig.once}
          className="grid gap-4 sm:grid-cols-3"
        >
          {VEHICLE_SIZES.map((size) => {
            const amount = service.pricing?.[size.id] ?? service.price;
            const highlighted = size.id === 'medium';
            return (
              <motion.li
                key={size.id}
                variants={fadeInUp}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card p-5 transition-shadow',
                  highlighted ? 'border-secondary shadow-luxury' : 'border-border'
                )}
              >
                {highlighted && (
                  <span className="absolute -top-3 inset-s-4 rounded-full bg-secondary px-3 py-0.5 text-[11px] font-bold text-primary">
                    محبوب‌ترین
                  </span>
                )}
                <p className="text-base font-bold text-foreground">{size.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{size.description}</p>
                <p className="mt-4 text-2xl font-black text-foreground tabular-nums">{formatToman(amount)}</p>
                <Button
                  asChild
                  variant={highlighted ? 'primary' : 'outline'}
                  className="mt-5 min-h-11 w-full gap-2"
                >
                  <Link href={bookingHref(service.id, size.id)}>
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    انتخاب و رزرو
                  </Link>
                </Button>
              </motion.li>
            );
          })}
        </motion.ul>
      </Section>

      {/* Quote configurator */}
      <Section id="quote" eyebrow="برآورد" title="محاسبهٔ دقیق قیمت" subtitle="اندازهٔ خودرو و خدمات تکمیلی را انتخاب کنید تا قیمت نهایی و زمان اجرا را ببینید." muted>
        <div className="mx-auto max-w-3xl">
          <QuoteCalculator services={[service, ...related.filter((s) => s.id !== service.id)]} initialServiceId={service.id} compact />
        </div>
      </Section>

      {/* Features */}
      {service.features && service.features.length > 0 && (
        <Section id="features" eyebrow="مزایا" title="این خدمت شامل چه مواردی است؟">
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig.once}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {service.features.map((feature) => (
              <motion.li
                key={feature}
                variants={fadeInUp}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-foreground"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                {feature}
              </motion.li>
            ))}
          </motion.ul>
        </Section>
      )}

      {/* Process */}
      {service.steps && service.steps.length > 0 && (
        <Section id="process" eyebrow="مراحل" title="روند انجام کار" muted>
          <ProcessTimeline steps={service.steps} />
        </Section>
      )}

      {/* Before / after */}
      {service.beforeAfter && (
        <Section id="before-after" eyebrow="نتیجه" title="قبل و بعد">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/60 shadow-luxury">
            <BeforeAfterSlider
              before={service.beforeAfter.before}
              after={service.beforeAfter.after}
              alt={service.beforeAfter.caption ?? service.name}
              aspect="16/9"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
          {service.beforeAfter.caption && (
            <p className="mt-3 text-center text-sm text-muted-foreground">{service.beforeAfter.caption}</p>
          )}
        </Section>
      )}

      {/* Gallery strip */}
      {galleryItems.length > 0 && (
        <Section id="gallery" eyebrow="نمونه کارها" title="گالری این خدمت" subtitle="برای مشاهدهٔ بزرگ‌تر و مقایسهٔ قبل/بعد روی هر تصویر بزنید.">
          <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
            {galleryItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openLightbox(index)}
                aria-label={`نمایش ${item.title}`}
                className="group relative aspect-4/3 w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-muted sm:w-[46%] lg:w-auto"
              >
                <Image
                  src={item.cover ?? item.after}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 46vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 text-start text-xs font-semibold text-white">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
          <Button asChild variant="link" className="mt-4 min-h-11 px-0">
            <Link href={`${ROUTES.GALLERY}?filter=${service.type}`}>مشاهدهٔ همهٔ نمونه کارها</Link>
          </Button>
          {lightboxOpen && (
            <Lightbox items={galleryItems} index={lightboxIndex} open={lightboxOpen} onOpenChange={setLightboxOpen} />
          )}
        </Section>
      )}

      {/* Add-ons */}
      {service.addons && service.addons.length > 0 && (
        <Section id="addons" eyebrow="خدمات تکمیلی" title="افزودنی‌های این خدمت" subtitle="هنگام رزرو می‌توانید هر کدام را به سفارش خود اضافه کنید." muted>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {service.addons.map((addon) => (
              <li key={addon.id} className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{addon.name}</p>
                  {addon.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{addon.description}</p>}
                </div>
                <span className="shrink-0 text-sm font-bold text-foreground tabular-nums">+{formatToman(addon.price)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Wrap visualiser */}
      {isWrapLike && (
        <Section id="visualizer" eyebrow="پیش‌نمایش" title="رنگ و جلوهٔ دلخواه را امتحان کنید">
          <div className="mx-auto max-w-4xl">
            <WrapVisualizer
              colors={WRAP_COLORS}
              basePrice={service.pricing?.medium ?? service.price}
              serviceId={service.id}
            />
          </div>
        </Section>
      )}

      {/* FAQ */}
      {service.faq && service.faq.length > 0 && (
        <Section id="faq" eyebrow="سؤالات متداول" title="پرسش‌های رایج" muted>
          <div className="mx-auto max-w-3xl">
            <FaqAccordion items={service.faq} />
          </div>
        </Section>
      )}

      {/* Reviews */}
      <Section id="reviews" eyebrow="نظرات" title="تجربهٔ مشتریان">
        <ReviewSection kind="service" targetId={service.id} reviews={reviews} rating={service.rating} reviewCount={service.reviewCount} />
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section id="related" eyebrow="پیشنهاد" title="خدمات مرتبط" muted>
          <SnapRow label="خدمات مرتبط" desktopClassName="lg:grid-cols-3">
            {related.map((item) => (
              <ServiceCard key={item.id} service={item} className="h-full" />
            ))}
          </SnapRow>
        </Section>
      )}

      <StickyCtaBar
        price={startingPrice}
        priceLabel="شروع از"
        primaryLabel="رزرو این خدمت"
        primaryIcon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
        primaryHref={bookingHref(service.id)}
        secondary={[
          {
            icon: <Phone className="h-5 w-5" aria-hidden="true" />,
            label: 'تماس',
            onClick: () => {
              window.location.href = `tel:${CONTACT.phoneEn}`;
            },
          },
        ]}
        visible={stickyVisible}
      />
    </div>
  );
}
