'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { TESTIMONIALS, toPersianDigits, type Testimonial } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { AmbientOrbs } from '@/components/ui/ambient';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const AUTOPLAY_MS = 6000;

/** Shown until the shared catalog ships real testimonials. */
const FALLBACK: Testimonial[] = [
  {
    id: 'f1',
    name: 'علی احمدی',
    role: 'صاحب بنز کلاس E',
    rating: 5,
    text: 'واقعاً فوق‌العاده بود! خودروی من مثل نو شد. تیم بسیار حرفه‌ای و با دقت کار می‌کنند. از رپینت و سرامیک بدنه بسیار راضی هستم.',
    date: '۱۴۰۳/۰۲/۱۵',
  },
  {
    id: 'f2',
    name: 'محمد رضایی',
    role: 'صاحب BMW سری ۵',
    rating: 5,
    text: 'بهترین مرکز دیتیلینگ که تا حالا تجربه کردم. محصولات درجه یک و کیفیت کار عالی. قیمت‌ها هم منصفانه است. قطعاً دوباره مراجعه خواهم کرد.',
    date: '۱۴۰۳/۰۳/۰۲',
  },
  {
    id: 'f3',
    name: 'حسین کریمی',
    role: 'صاحب پورشه کاین',
    rating: 5,
    text: 'از خدمات و پشتیبانی عالی اتولانژ بسیار راضی هستم. سیستم رزرو آنلاین خیلی راحت بود و تیم دقیقاً سر وقت کار را شروع کردند.',
    date: '۱۴۰۳/۰۳/۲۰',
  },
  {
    id: 'f4',
    name: 'رضا موسوی',
    role: 'صاحب لکسوس ES',
    rating: 4,
    text: 'محصولاتی که از فروشگاه آنلاین خریدم اصل بودند و کیفیت عالی داشتند. پیشنهادهای تخصصی تیم پشتیبانی هم خیلی کمک‌کننده بود.',
    date: '۱۴۰۳/۰۴/۰۸',
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${toPersianDigits(rating)} از ${toPersianDigits(5)} ستاره`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < Math.round(rating) ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/40 glass-effect-strong p-5 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Stars rating={item.rating} />
        <Quote className="h-6 w-6 text-secondary/50" aria-hidden="true" />
      </div>
      <p className="flex-1 text-sm leading-relaxed text-foreground sm:text-base">{item.text}</p>
      <footer className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
        <Avatar
          src={item.avatar}
          alt={item.name}
          fallback={item.name.trim().charAt(0)}
          size="lg"
          className="ring-2 ring-secondary/40 [&>div]:bg-linear-to-br [&>div]:from-primary [&>div]:to-secondary [&>div]:text-primary-foreground"
        />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground">{item.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {[item.role, item.carModel, item.serviceName].filter(Boolean).join(' · ')}
          </p>
        </div>
      </footer>
    </article>
  );
}

export const Testimonials: React.FC = () => {
  const items = TESTIMONIALS.length > 0 ? TESTIMONIALS : FALLBACK;
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [interacting, setInteracting] = useState(false);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const [viewportRef, embla] = useEmblaCarousel({
    direction: 'rtl',
    loop: items.length > 1,
    align: 'center',
    dragFree: false,
    skipSnaps: false,
    containScroll: false,
  });

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    onSelect();
    const onReInit = () => {
      setSnaps(embla.scrollSnapList());
      onSelect();
    };
    const onPointerDown = () => setInteracting(true);
    const onSettle = () => setInteracting(false);
    embla.on('select', onSelect);
    embla.on('reInit', onReInit);
    embla.on('pointerDown', onPointerDown);
    embla.on('settle', onSettle);
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onReInit);
      embla.off('pointerDown', onPointerDown);
      embla.off('settle', onSettle);
    };
  }, [embla, onSelect]);

  // Simple autoplay, paused while interacting / hovering / focused / off-screen / reduced motion
  const autoplay = !reduced && inView && !interacting && items.length > 1;
  useEffect(() => {
    if (!embla || !autoplay) return;
    const timer = setInterval(() => embla.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [embla, autoplay]);

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background-secondary py-16 sm:py-24"
      aria-labelledby="testimonials-title"
    >
      <AmbientOrbs variant="section" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-14"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-4 py-2 text-sm font-semibold text-success">
            رضایت مشتریان
          </span>
          <h2 id="testimonials-title" className="section-title text-gradient-luxury">
            نظرات مشتریان
          </h2>
          <p className="section-subtitle mb-0!">تجربه مشتریان ما از خدمات اتولانژ</p>
        </motion.div>

        <div
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false);
          }}
        >
          <div
            ref={viewportRef}
            className="overflow-hidden"
            role="region"
            aria-roledescription="carousel"
            aria-label="نظرات مشتریان"
          >
            <div className="-ms-3 flex touch-pan-y sm:-ms-4">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="min-w-0 flex-[0_0_100%] ps-3 sm:ps-4 md:flex-[0_0_50%] lg:flex-[0_0_33.3333%]"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${toPersianDigits(i + 1)} از ${toPersianDigits(items.length)}`}
                >
                  <motion.div
                    className="h-full"
                    animate={{ opacity: selected === i ? 1 : 0.6, scale: selected === i ? 1 : 0.97 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TestimonialCard item={item} />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {items.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <IconButton
                label="نظر قبلی"
                icon={<ChevronRight />}
                variant="outline"
                className="rounded-full"
                onClick={() => embla?.scrollPrev()}
              />
              <div className="flex items-center" role="tablist" aria-label="انتخاب نظر">
                {snaps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={selected === i}
                    aria-label={`نظر ${toPersianDigits(i + 1)}`}
                    onClick={() => embla?.scrollTo(i)}
                    className="flex h-11 w-8 items-center justify-center"
                  >
                    <span
                      className={cn(
                        'block h-2 rounded-full transition-all duration-300',
                        selected === i ? 'w-6 bg-secondary' : 'w-2 bg-muted-foreground/40'
                      )}
                    />
                  </button>
                ))}
              </div>
              <IconButton
                label="نظر بعدی"
                icon={<ChevronLeft />}
                variant="outline"
                className="rounded-full"
                onClick={() => embla?.scrollNext()}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
