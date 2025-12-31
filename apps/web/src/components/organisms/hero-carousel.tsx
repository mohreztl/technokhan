'use client';

import { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { carouselSlide, carouselTransition } from '@/lib/animation-variants';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  ctaPrimary?: {
    text: string;
    href: string;
  };
  ctaSecondary?: {
    text: string;
    href: string;
  };
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
  enableAutoPlay?: boolean;
  className?: string;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function HeroCarousel({
  slides,
  autoPlayInterval = 5000,
  enableAutoPlay = true,
  className = '',
}: HeroCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Wrap index to stay within bounds
  const slideIndex = ((page % slides.length) + slides.length) % slides.length;
  const currentSlide = slides[slideIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page]
  );

  // Auto-play functionality
  useEffect(() => {
    if (!enableAutoPlay || isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [enableAutoPlay, isPaused, autoPlayInterval, paginate, prefersReducedMotion]);

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      paginate(1); // RTL: left arrow goes forward
    } else if (e.key === 'ArrowRight') {
      paginate(-1); // RTL: right arrow goes backward
    }
  };

  // Swipe/drag handlers
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipe = swipePower(offset.x, velocity.x);

    // RTL: Reversed logic
    if (swipe < -swipeConfidenceThreshold) {
      paginate(-1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(1);
    }
  };

  const goToSlide = (index: number) => {
    const newDirection = index > slideIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="بخش قهرمان"
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={prefersReducedMotion ? undefined : carouselSlide}
            initial={prefersReducedMotion ? false : 'enter'}
            animate="center"
            exit={prefersReducedMotion ? undefined : 'exit'}
            transition={prefersReducedMotion ? { duration: 0 } : carouselTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={currentSlide.image}
                alt={currentSlide.title}
                fill
                priority={slideIndex === 0}
                quality={90}
                className="object-cover"
                sizes="100vw"
              />
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent dark:from-background/95 dark:via-background/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="container-custom text-center">
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="max-w-4xl mx-auto"
                >
                  {currentSlide.subtitle && (
                    <p className="text-secondary text-sm md:text-base font-medium mb-4 tracking-wider">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6">
                    {currentSlide.title}
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl text-foreground-muted mb-8 max-w-3xl mx-auto">
                    {currentSlide.description}
                  </p>

                  {/* CTA Buttons */}
                  {(currentSlide.ctaPrimary || currentSlide.ctaSecondary) && (
                    <div className="flex flex-wrap gap-4 justify-center">
                      {currentSlide.ctaPrimary && (
                        <a
                          href={currentSlide.ctaPrimary.href}
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          {currentSlide.ctaPrimary.text}
                        </a>
                      )}
                      {currentSlide.ctaSecondary && (
                        <a
                          href={currentSlide.ctaSecondary.href}
                          className="border-2 border-foreground hover:bg-foreground hover:text-background text-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                        >
                          {currentSlide.ctaSecondary.text}
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(1)}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 glass-effect p-3 rounded-full hover:bg-primary/20 transition-all duration-300 group"
        aria-label="الشريحة التالية"
      >
        <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
      </button>
      <button
        onClick={() => paginate(-1)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 glass-effect p-3 rounded-full hover:bg-primary/20 transition-all duration-300 group"
        aria-label="الشريحة السابقة"
      >
        <ChevronRight className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === slideIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-foreground/30 hover:bg-foreground/50'
            } h-2 rounded-full`}
            aria-label={`انتقل إلى الشريحة ${index + 1}`}
            aria-current={index === slideIndex ? 'true' : 'false'}
          >
            <span className="sr-only">
              {index === slideIndex ? 'الشريحة الحالية' : `الشريحة ${index + 1}`}
            </span>
          </button>
        ))}
      </div>

      {/* Pause/Play Indicator (for screen readers) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPaused ? 'العرض متوقف مؤقتاً' : 'العرض يعمل تلقائياً'}
      </div>
    </div>
  );
}
