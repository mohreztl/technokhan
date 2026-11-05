'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';

export interface SnapRowProps {
  children: React.ReactNode;
  /** Accessible name of the scroller. */
  label: string;
  className?: string;
  /** Width of each slide below `lg` (embla flex basis). */
  slideClassName?: string;
  /** Grid columns at `lg+` where the row becomes a static grid. */
  desktopClassName?: string;
  /** Pagination dots below `lg`. */
  dots?: boolean;
}

/**
 * Horizontal snap carousel on phones/tablets (embla, RTL, peeking next card)
 * that turns into a plain CSS grid at `lg+`. Wrap each card as a child.
 */
export function SnapRow({
  children,
  label,
  className,
  slideClassName = 'flex-[0_0_82%] sm:flex-[0_0_56%] md:flex-[0_0_44%]',
  desktopClassName = 'lg:grid-cols-3',
  dots = true,
}: SnapRowProps) {
  const [viewportRef, embla] = useEmblaCarousel({
    direction: 'rtl',
    align: 'start',
    containScroll: 'trimSnaps',
    breakpoints: { '(min-width: 1024px)': { active: false } },
  });
  const [snaps, setSnaps] = React.useState<number[]>([]);
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setSnaps(embla.scrollSnapList());
      setSelected(embla.selectedScrollSnap());
    };
    sync();
    embla.on('select', sync);
    embla.on('reInit', sync);
    return () => {
      embla.off('select', sync);
      embla.off('reInit', sync);
    };
  }, [embla]);

  const slides = React.Children.toArray(children).filter(Boolean);

  return (
    <div className={className}>
      <div
        ref={viewportRef}
        className="-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <div className={cn('flex gap-4 lg:grid lg:gap-6', desktopClassName)}>
          {slides.map((child, index) => (
            <div
              key={(React.isValidElement(child) && child.key) || index}
              className={cn('min-w-0 lg:w-auto lg:flex-none', slideClassName)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${toPersianDigits(index + 1)} از ${toPersianDigits(slides.length)}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {dots && snaps.length > 1 && (
        <div className="mt-4 flex items-center justify-center lg:hidden" role="tablist" aria-label="صفحات">
          {snaps.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-label={`رفتن به اسلاید ${toPersianDigits(index + 1)}`}
              onClick={() => embla?.scrollTo(index)}
              className="flex h-11 w-7 items-center justify-center"
            >
              <span
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === selected ? 'w-6 bg-secondary' : 'w-2 bg-muted-foreground/30'
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
