'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryItem } from '@technokhan/shared';
import { SERVICE_TYPE_LABELS, toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useBodyScrollLock } from '@/lib/hooks/use-body-scroll-lock';
import { BeforeAfterSlider } from './before-after-slider';

export interface LightboxProps {
  items: GalleryItem[];
  /** item to show when opening (do not feed `onIndexChange` back into this on every swipe) */
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
}

type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

const clampIndex = (i: number, n: number) => Math.min(Math.max(i, 0), Math.max(n - 1, 0));
const counterFa = (i: number, n: number) => toPersianDigits(`${i + 1} / ${n}`);
const captionOf = (item: GalleryItem) =>
  [item.vehicle, SERVICE_TYPE_LABELS[item.serviceType]].filter(Boolean).join(' • ');

/** Arrow keys follow the document direction: in RTL «←» is next. */
function useArrowKeys(active: boolean, onPrev: () => void, onNext: () => void, onClose?: () => void) {
  useEffect(() => {
    if (!active) return;
    const rtl = document.documentElement.dir !== 'ltr';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        (rtl ? onNext : onPrev)();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        (rtl ? onPrev : onNext)();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onPrev, onNext, onClose]);
}

/**
 * Gallery lightbox: full-screen swipe deck on phones (embla, RTL, drag-down to close),
 * centered dialog with arrows on desktop. Every slide is a BeforeAfterSlider.
 * Safe for next/dynamic — nothing touches window at module scope.
 */
export function Lightbox(props: LightboxProps) {
  const isMobile = useIsMobile();
  if (props.items.length === 0) return null;
  return isMobile ? <MobileLightbox {...props} /> : <DesktopLightbox {...props} />;
}

function MobileLightbox({ items, index, open, onOpenChange, onIndexChange }: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useBodyScrollLock(open);
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(() => clampIndex(index, items.length));
  const y = useMotionValue(0);
  const backdrop = useTransform(y, [0, 320], [1, 0.3]);
  const onIndexChangeRef = useRef(onIndexChange);
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  const options = useMemo<EmblaOptions>(
    () => ({
      direction: 'rtl',
      loop: false,
      align: 'center',
      containScroll: 'trimSnaps',
      startIndex: clampIndex(index, items.length),
      duration: reduced ? 0 : 22,
      // let the before/after handle own horizontal drags that start on it
      watchDrag: (_api, event) =>
        !(event.target as Element | null)?.closest?.('[data-ba-handle]'),
    }),
    [index, items.length, reduced]
  );
  const [emblaRef, embla] = useEmblaCarousel(options);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      const i = embla.selectedScrollSnap();
      setCurrent(i);
      onIndexChangeRef.current?.(i);
    };
    embla.on('select', onSelect);
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla]);

  useEffect(() => {
    if (!open) return;
    y.set(0);
    const i = clampIndex(index, items.length);
    setCurrent(i);
    embla?.scrollTo(i, true);
  }, [open, index, items.length, embla, y]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);
  useArrowKeys(open, prev, next, close);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 900) close();
  };

  if (!mounted) return null;
  const item = items[clampIndex(current, items.length)];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item?.title ?? 'گالری'}
          className="fixed inset-0 z-70 flex flex-col text-white"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div aria-hidden="true" className="absolute inset-0 bg-black" style={{ opacity: backdrop }} />

          <header className="pt-safe relative z-10 flex items-center justify-between px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="بستن"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Button>
            <span className="text-sm tabular-nums" aria-live="polite">
              {counterFa(current, items.length)}
            </span>
            <span className="w-11" aria-hidden="true" />
          </header>

          <motion.div
            className="relative z-10 flex-1 touch-none"
            drag
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={{ top: 0.08, bottom: 0.75, left: 0, right: 0 }}
            dragMomentum={false}
            style={{ y }}
            onDragEnd={onDragEnd}
          >
            <div ref={emblaRef} className="h-full overflow-hidden" dir="rtl">
              <div className="flex h-full">
                {items.map((it) => (
                  <div key={it.id} className="flex min-w-0 flex-[0_0_100%] flex-col justify-center px-3">
                    <BeforeAfterSlider
                      before={it.before}
                      after={it.after}
                      alt={it.title}
                      aspect="4/3"
                      sizes="100vw"
                      className="w-full"
                    />
                    <div className="mt-4 px-1">
                      <h3 className="text-base font-bold">{it.title}</h3>
                      {captionOf(it) && <p className="mt-1 text-sm text-white/70">{captionOf(it)}</p>}
                      {it.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80">
                          {it.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <p className="pb-safe relative z-10 pb-3 text-center text-xs text-white/50">
            برای بستن به پایین بکشید
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function DesktopLightbox({ items, index, open, onOpenChange, onIndexChange }: LightboxProps) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(() => clampIndex(index, items.length));
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (open) setCurrent(clampIndex(index, items.length));
  }, [open, index, items.length]);

  const go = useCallback(
    (delta: number) => {
      const n = clampIndex(current + delta, items.length);
      if (n === current) return;
      setDir(delta);
      setCurrent(n);
      onIndexChange?.(n);
    },
    [current, items.length, onIndexChange]
  );
  const prev = useCallback(() => go(-1), [go]);
  const next = useCallback(() => go(1), [go]);
  // Escape is handled by DialogContent.
  useArrowKeys(open, prev, next);

  const item = items[clampIndex(current, items.length)];

  return createPortal(
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        {item && (
          <div className="p-4 pt-14 sm:p-6 sm:pt-14">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                initial={reduced ? false : { opacity: 0, x: dir * -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: dir * 24 }}
                transition={{ duration: 0.22 }}
              >
                <BeforeAfterSlider
                  before={item.before}
                  after={item.after}
                  alt={item.title}
                  aspect="16/9"
                  sizes="(max-width: 1280px) 90vw, 1024px"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                {captionOf(item) && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{captionOf(item)}</p>
                )}
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.description}</p>
                )}
                {item.tags.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <li key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        #{t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="glass" size="icon" onClick={prev} disabled={current === 0} aria-label="قبلی">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Button>
                <span
                  className="min-w-18 text-center text-sm tabular-nums text-muted-foreground"
                  aria-live="polite"
                >
                  {counterFa(current, items.length)}
                </span>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={next}
                  disabled={current >= items.length - 1}
                  aria-label="بعدی"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>,
    document.body
  );
}
