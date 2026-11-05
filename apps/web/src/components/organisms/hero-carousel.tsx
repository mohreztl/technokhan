'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  type AnimationPlaybackControls,
  type PanInfo,
} from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Star, type LucideIcon } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { SplitText } from '@/components/ui/text-effects';
import { AmbientOrbs, GoldLines } from '@/components/ui/ambient';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { heroContent, heroItem } from '@/lib/animation-variants';

export interface HeroSlide {
  id: string | number;
  title: string;
  /** Small gold kicker above the title */
  subtitle?: string;
  description: string;
  image: string;
  imageAlt?: string;
  /** Gold badge, rendered above the kicker (slide 1) */
  badge?: string;
  /** Compact feature pills under the description (slide 1) */
  features?: { icon: LucideIcon; text: string }[];
  ctaPrimary?: { text: string; href: string; icon?: LucideIcon };
  ctaSecondary?: { text: string; href: string; icon?: LucideIcon };
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** ms per slide */
  autoPlayInterval?: number;
  enableAutoPlay?: boolean;
  className?: string;
}

const SWIPE_OFFSET = 60;
const SWIPE_VELOCITY = 400;

/**
 * Cinematic full-bleed hero: crossfading Ken Burns images, one `h1` per
 * active slide, gold CTAs, progress bar, dots, swipe, keyboard, autoplay
 * that pauses on hover / touch / focus / hidden tab.
 */
export function HeroCarousel({
  slides,
  autoPlayInterval = 7000,
  enableAutoPlay = true,
  className,
}: HeroCarouselProps) {
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const progress = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  const count = slides.length;
  const slide = slides[index];

  const goTo = useCallback(
    (next: number, dir?: number) => {
      const wrapped = ((next % count) + count) % count;
      setPage(([current]) => [wrapped, dir ?? (wrapped > current ? 1 : -1)]);
    },
    [count]
  );
  const next = useCallback(() => setPage(([i]) => [(i + 1) % count, 1]), [count]);
  const prev = useCallback(() => setPage(([i]) => [(i - 1 + count) % count, -1]), [count]);

  // Tab visibility
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const autoplay = enableAutoPlay && count > 1 && !prefersReducedMotion;
  const running = autoplay && !paused && !hidden && inView;

  // Progress animation doubles as the autoplay timer (pausable)
  useEffect(() => {
    if (!autoplay) return;
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: autoPlayInterval / 1000,
      ease: 'linear',
      onComplete: next,
    });
    controlsRef.current = controls;
    return () => {
      controls.stop();
      controlsRef.current = null;
    };
  }, [index, autoplay, autoPlayInterval, progress, next]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (running) controls.play();
    else controls.pause();
  }, [running, index]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // RTL: the "next" slide is to the left
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      prev();
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    // RTL: dragging the track to the right reveals the next slide
    if (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY) next();
    else if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) prev();
  };

  const kenBurns = !prefersReducedMotion;
  const bottomOffset = 'bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] lg:bottom-6';

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative -mt-[calc(5rem+env(safe-area-inset-top))] min-h-dvh overflow-hidden bg-primary-800 text-white',
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="معرفی اتولانژ"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Images (all mounted so slide changes never flash; only the active one is visible) */}
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <motion.div
              key={s.id}
              className="absolute inset-0 will-change-transform"
              initial={false}
              animate={{ opacity: active ? 1 : 0, scale: active && kenBurns ? 1.08 : 1 }}
              transition={{
                opacity: { duration: 1, ease: 'easeInOut' },
                scale: active
                  ? { duration: autoPlayInterval / 1000 + 1.5, ease: 'linear' }
                  : { duration: 0 },
              }}
              style={{ zIndex: active ? 1 : 0 }}
            >
              <Image
                src={s.image}
                alt={s.imageAlt ?? ''}
                fill
                priority={i === 0}
                sizes="100vw"
                quality={82}
                className="object-cover"
              />
            </motion.div>
          );
        })}
        {/* Legibility overlays — fixed dark tones so white text works in both themes */}
        <div className="absolute inset-0 z-2 bg-linear-to-t from-black/90 via-black/45 to-black/25" />
        <div className="absolute inset-0 z-2 bg-linear-to-l from-primary-900/40 via-transparent to-primary-900/30" />
      </div>

      <AmbientOrbs variant="hero" className="z-3 opacity-70 mix-blend-screen" />
      <GoldLines className="z-3" />

      {/* Content layer (swipeable) */}
      <motion.div
        className="relative z-10 flex min-h-dvh flex-col justify-end px-4 pb-[calc(4rem+env(safe-area-inset-bottom)+5rem)] pt-28 sm:justify-center sm:px-6 sm:pb-32 sm:pt-32 lg:pb-28"
        drag={count > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <div className="container-custom">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={prefersReducedMotion ? undefined : heroContent}
              initial="enter"
              animate="center"
              exit="exit"
              className="mx-auto flex max-w-4xl flex-col items-center text-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`اسلاید ${toPersianDigits(index + 1)} از ${toPersianDigits(count)}`}
            >
              {slide.badge && (
                <motion.span
                  variants={heroItem}
                  className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-secondary-200/50 bg-linear-to-r from-secondary-400 via-secondary-300 to-secondary-400 px-3 py-1 text-xs font-bold text-primary-900 shadow-[0_2px_12px_hsl(var(--secondary)/0.45)] sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  {slide.badge}
                </motion.span>
              )}

              {slide.subtitle && (
                <motion.p
                  variants={heroItem}
                  className="mb-3 text-sm font-semibold tracking-wide text-secondary sm:text-base"
                >
                  {slide.subtitle}
                </motion.p>
              )}

              <motion.h1
                variants={heroItem}
                className="mb-4 text-balance text-4xl font-black leading-[1.15] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-5xl md:text-7xl lg:text-8xl"
              >
                {prefersReducedMotion ? (
                  slide.title
                ) : (
                  <SplitText text={slide.title} splitBy="word" stagger={0.08} delay={0.1} immediate />
                )}
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mb-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl"
              >
                {slide.description}
              </motion.p>

              {slide.features && slide.features.length > 0 && (
                <motion.ul
                  variants={heroItem}
                  className="mb-6 flex flex-wrap items-center justify-center gap-2"
                  aria-label="ویژگی‌ها"
                >
                  {slide.features.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li
                        key={f.text}
                        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:px-4 sm:text-sm"
                      >
                        <Icon className="h-3.5 w-3.5 text-secondary sm:h-4 sm:w-4" aria-hidden="true" />
                        {f.text}
                      </li>
                    );
                  })}
                </motion.ul>
              )}

              {(slide.ctaPrimary || slide.ctaSecondary) && (
                <motion.div
                  variants={heroItem}
                  className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
                >
                  {slide.ctaPrimary && (
                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="min-w-48 gap-2 rounded-xl shadow-glow-secondary"
                    >
                      <Link href={slide.ctaPrimary.href}>
                        {slide.ctaPrimary.icon && (
                          <slide.ctaPrimary.icon className="h-5 w-5" aria-hidden="true" />
                        )}
                        {slide.ctaPrimary.text}
                      </Link>
                    </Button>
                  )}
                  {slide.ctaSecondary && (
                    <Button
                      asChild
                      size="lg"
                      variant="glass"
                      className="min-w-48 gap-2 rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20"
                    >
                      <Link href={slide.ctaSecondary.href}>
                        {slide.ctaSecondary.icon && (
                          <slide.ctaSecondary.icon className="h-5 w-5" aria-hidden="true" />
                        )}
                        {slide.ctaSecondary.text}
                      </Link>
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Arrows (pointer devices) */}
      {count > 1 && (
        <>
          <IconButton
            label="اسلاید قبلی"
            icon={<ChevronRight />}
            size="lg"
            variant="glass"
            className="absolute inset-s-4 top-1/2 z-20 hidden -translate-y-1/2 border-white/20 bg-white/10 text-white hover:bg-white/20 md:inline-flex lg:inset-s-8"
            onClick={prev}
          />
          <IconButton
            label="اسلاید بعدی"
            icon={<ChevronLeft />}
            size="lg"
            variant="glass"
            className="absolute inset-e-4 top-1/2 z-20 hidden -translate-y-1/2 border-white/20 bg-white/10 text-white hover:bg-white/20 md:inline-flex lg:inset-e-8"
            onClick={next}
          />
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div
          className={cn('absolute left-1/2 z-20 flex -translate-x-1/2 items-center', bottomOffset)}
          role="tablist"
          aria-label="انتخاب اسلاید"
        >
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-current={active ? 'true' : undefined}
                aria-label={`رفتن به اسلاید ${toPersianDigits(i + 1)}`}
                onClick={() => goTo(i)}
                className="group flex h-11 w-11 items-center justify-center outline-hidden"
              >
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-secondary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/50',
                    active ? 'w-7 bg-secondary' : 'w-2 bg-white/40 group-hover:bg-white/70'
                  )}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Scroll cue */}
      <motion.a
        href="#hero-stats"
        aria-label="رفتن به ادامه صفحه"
        className={cn(
          'absolute left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-0.5 text-[11px] text-white/60 sm:flex',
          'bottom-[calc(4rem+env(safe-area-inset-bottom)+3.25rem)] lg:bottom-16'
        )}
        animate={running ? { y: [0, 6, 0] } : { y: 0 }}
        transition={running ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <span>اسکرول کنید</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </motion.a>

      {/* Progress bar */}
      {autoplay && (
        <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/10" aria-hidden="true">
          <motion.div
            className="h-full bg-linear-to-l from-secondary-300 via-secondary to-secondary-300"
            style={{ scaleX: progress, originX: 1 }}
          />
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {running ? 'اسلایدها به‌صورت خودکار تغییر می‌کنند' : 'نمایش خودکار متوقف است'}
      </div>
    </section>
  );
}
