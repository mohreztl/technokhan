'use client';

import * as React from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';

const PLACEHOLDER = '/images/placeholder-product.webp';

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  /** Receives the main image wrapper (fly-to-cart origin). */
  mainImageRef?: React.RefObject<HTMLDivElement | null>;
  priority?: boolean;
  className?: string;
}

function useEmblaIndex(embla: ReturnType<typeof useEmblaCarousel>[1]) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (!embla) return;
    const sync = () => setIndex(embla.selectedScrollSnap());
    sync();
    embla.on('select', sync);
    embla.on('reInit', sync);
    return () => {
      embla.off('select', sync);
      embla.off('reInit', sync);
    };
  }, [embla]);
  return index;
}

/** Swipeable product image gallery with thumbnails and a full-screen viewer. */
export function ProductGallery({ images, alt, mainImageRef, priority, className }: ProductGalleryProps) {
  const list = images.length > 0 ? images : [PLACEHOLDER];
  const multiple = list.length > 1;

  const [viewportRef, embla] = useEmblaCarousel({ direction: 'rtl', loop: multiple, align: 'start' });
  const index = useEmblaIndex(embla);

  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerStart, setViewerStart] = React.useState(0);
  const openViewer = (at: number) => {
    setViewerStart(at);
    setViewerOpen(true);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <div
          ref={viewportRef}
          className="overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-luxury"
          role="region"
          aria-roledescription="carousel"
          aria-label={`تصاویر ${alt}`}
        >
          <div className="flex">
            {list.map((src, i) => (
              <div
                key={src + i}
                className="relative aspect-square min-w-0 flex-[0_0_100%]"
                ref={i === 0 ? mainImageRef : undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${toPersianDigits(i + 1)} از ${toPersianDigits(list.length)}`}
              >
                <button
                  type="button"
                  onClick={() => openViewer(i)}
                  className="absolute inset-0 block h-full w-full cursor-zoom-in focus-visible:outline-hidden"
                  aria-label={`بزرگ‌نمایی تصویر ${toPersianDigits(i + 1)}`}
                >
                  <Image
                    src={src}
                    alt={i === 0 ? alt : `${alt} - تصویر ${toPersianDigits(i + 1)}`}
                    fill
                    priority={priority && i === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <IconButton
          label="نمایش تمام‌صفحه"
          icon={<Maximize2 />}
          variant="glass"
          onClick={() => openViewer(index)}
          className="absolute inset-e-3 top-3 bg-background/70 text-foreground shadow-md"
        />

        {multiple && (
          <>
            <IconButton
              label="تصویر قبلی"
              icon={<ChevronRight />}
              variant="glass"
              onClick={() => embla?.scrollPrev()}
              className="absolute inset-s-3 top-1/2 hidden -translate-y-1/2 bg-background/70 text-foreground shadow-md lg:inline-flex"
            />
            <IconButton
              label="تصویر بعدی"
              icon={<ChevronLeft />}
              variant="glass"
              onClick={() => embla?.scrollNext()}
              className="absolute inset-e-3 top-1/2 hidden -translate-y-1/2 bg-background/70 text-foreground shadow-md lg:inline-flex"
            />
            <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center gap-1.5" aria-hidden="true">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full bg-white/80 shadow-sm transition-all duration-300',
                    i === index ? 'w-5' : 'w-1.5 opacity-60'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {multiple && (
        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="انتخاب تصویر">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`تصویر ${toPersianDigits(i + 1)}`}
              onClick={() => embla?.scrollTo(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-muted transition-all',
                i === index ? 'border-secondary shadow-glow-secondary' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <FullscreenViewer
        images={list}
        alt={alt}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        startIndex={viewerStart}
      />
    </div>
  );
}

interface FullscreenViewerProps {
  images: string[];
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex: number;
}

function FullscreenViewer({ images, alt, open, onOpenChange, startIndex }: FullscreenViewerProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`تصاویر ${alt}`}
      hideHeader
      snapPoints={[1]}
      className="bg-black text-white"
      contentClassName="p-0"
      desktopClassName="max-w-5xl overflow-hidden border-0 bg-black p-0 text-white"
    >
      {open && (
        <ViewerCarousel images={images} alt={alt} startIndex={startIndex} onClose={() => onOpenChange(false)} />
      )}
    </ResponsiveDialog>
  );
}

function ViewerCarousel({
  images,
  alt,
  startIndex,
  onClose,
}: {
  images: string[];
  alt: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [viewportRef, embla] = useEmblaCarousel({ direction: 'rtl', startIndex, loop: images.length > 1 });
  const index = useEmblaIndex(embla);

  return (
    <div className="relative flex h-dvh flex-col bg-black lg:h-[80vh]">
      <div className="flex items-center justify-between px-3 pt-safe">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums" aria-live="polite">
          {toPersianDigits(index + 1)} / {toPersianDigits(images.length)}
        </span>
        <IconButton label="بستن" icon={<X />} variant="ghost" onClick={onClose} className="text-white hover:bg-white/10" />
      </div>
      <div ref={viewportRef} className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {images.map((src, i) => (
            <div key={src + i} className="relative min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${alt} - تصویر ${toPersianDigits(i + 1)}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 px-3 pb-safe pt-2">
          <IconButton label="تصویر قبلی" icon={<ChevronRight />} variant="ghost" onClick={() => embla?.scrollPrev()} className="text-white hover:bg-white/10" />
          <div className="flex gap-1.5" aria-hidden="true">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn('h-1.5 rounded-full bg-white transition-all', i === index ? 'w-5' : 'w-1.5 opacity-50')}
              />
            ))}
          </div>
          <IconButton label="تصویر بعدی" icon={<ChevronLeft />} variant="ghost" onClick={() => embla?.scrollNext()} className="text-white hover:bg-white/10" />
        </div>
      )}
    </div>
  );
}
