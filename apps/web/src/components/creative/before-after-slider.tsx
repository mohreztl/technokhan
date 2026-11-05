'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import { ChevronsLeftRight } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export type BeforeAfterAspect = '4/3' | '16/9' | '1/1';

export interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt: string;
  aspect?: BeforeAfterAspect;
  /** initial divider position, 0–100, measured from the LEFT edge (direction-independent) */
  initial?: number;
  /**
   * Which side shows the BEFORE image. 'right' (default) reads naturally in RTL:
   * «قبل» on the right, «بعد» on the left. Geometry is always left-based.
   */
  beforeSide?: 'left' | 'right';
  /** next/image `sizes` hint */
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** fires on every frame the divider moves (0–100) */
  onChange?: (percent: number) => void;
}

const ASPECT_CLASS: Record<BeforeAfterAspect, string> = {
  '4/3': 'aspect-4/3',
  '16/9': 'aspect-video',
  '1/1': 'aspect-square',
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const LABEL_CLASS =
  'pointer-events-none absolute top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm';

export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'قبل',
  afterLabel = 'بعد',
  alt,
  aspect = '4/3',
  initial = 50,
  beforeSide = 'right',
  sizes = '(max-width: 1024px) 100vw, 50vw',
  priority,
  className,
  onChange,
}: BeforeAfterSliderProps) {
  const start = clamp(initial, 0, 100);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const reduced = useReducedMotion();
  const inView = useInView(containerRef, { once: true, amount: 0.5 });
  const [interacted, setInteracted] = useState(false);

  /** px offset of the handle from its CSS resting spot (`left: start%`) — driven by framer drag */
  const x = useMotionValue(0);
  /** measured container width */
  const width = useMotionValue(0);
  /** 0–100 from the left edge; derived, never React state */
  const percent = useTransform(() => {
    const w = width.get();
    return w > 0 ? clamp(start + (x.get() / w) * 100, 0, 100) : start;
  });
  const clip = useTransform(percent, (p) =>
    beforeSide === 'right' ? `inset(0 ${100 - p}% 0 0)` : `inset(0 0 0 ${p}%)`
  );
  const leftLabelOpacity = useTransform(percent, [0, 16], [0, 1]);
  const rightLabelOpacity = useTransform(percent, [84, 100], [1, 0]);

  const toPx = useCallback(
    (p: number) => ((clamp(p, 0, 100) - start) / 100) * width.get(),
    [start, width]
  );

  const moveTo = useCallback(
    (p: number, animated: boolean) => {
      const target = toPx(p);
      if (animated && !reduced) {
        animate(x, target, { type: 'spring', stiffness: 300, damping: 32 });
      } else {
        x.set(target);
      }
    },
    [toPx, reduced, x]
  );

  // Keep the divider at the same percentage across resizes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const p = percent.get();
      width.set(el.getBoundingClientRect().width);
      x.set(toPx(p));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [percent, width, x, toPx]);

  // Mirror the live value into ARIA without re-rendering.
  useMotionValueEvent(percent, 'change', (p) => {
    const el = handleRef.current;
    if (el) {
      const rounded = Math.round(p);
      el.setAttribute('aria-valuenow', String(rounded));
      el.setAttribute('aria-valuetext', `${toPersianDigits(rounded)}٪`);
    }
    onChangeRef.current?.(p);
  });

  // One-time nudge when the slider first scrolls into view (stops on interaction).
  useEffect(() => {
    if (!inView || interacted || reduced) return;
    const w = width.get();
    if (!w) return;
    const base = x.get();
    const d = w * 0.06;
    const controls = animate(x, [base, base - d, base + d, base], {
      duration: 1.8,
      ease: 'easeInOut',
      delay: 0.5,
    });
    return () => controls.stop();
  }, [inView, interacted, reduced, width, x]);

  const markInteracted = useCallback(() => setInteracted(true), []);

  const clampDrag = useCallback(() => {
    const v = x.get();
    const min = toPx(0);
    const max = toPx(100);
    if (v < min) x.set(min);
    else if (v > max) x.set(max);
  }, [x, toPx]);

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-ba-handle]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    markInteracted();
    moveTo(((e.clientX - rect.left) / rect.width) * 100, true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const p = percent.get();
    let next: number;
    switch (e.key) {
      case 'ArrowLeft':
        next = p - 5;
        break;
      case 'ArrowRight':
        next = p + 5;
        break;
      case 'PageDown':
        next = p - 20;
        break;
      case 'PageUp':
        next = p + 20;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 100;
        break;
      default:
        return;
    }
    e.preventDefault();
    markInteracted();
    moveTo(next, true);
  };

  const leftLabel = beforeSide === 'right' ? afterLabel : beforeLabel;
  const rightLabel = beforeSide === 'right' ? beforeLabel : afterLabel;
  const showPulse = inView && !interacted && !reduced;

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full select-none overflow-hidden rounded-2xl bg-muted',
        ASPECT_CLASS[aspect],
        className
      )}
      style={{ touchAction: 'pan-y' }}
      onClick={onTap}
    >
      {/* BEFORE — base layer */}
      <Image
        src={before}
        alt={`${alt} — ${beforeLabel}`}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="pointer-events-none object-cover"
      />

      {/* AFTER — top layer, clipped by the divider */}
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        <Image
          src={after}
          alt={`${alt} — ${afterLabel}`}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className="pointer-events-none object-cover"
        />
      </motion.div>

      {/* Labels sit over the image they describe (physical left/right on purpose) */}
      <motion.span style={{ opacity: leftLabelOpacity }} className={cn(LABEL_CLASS, 'left-3')}>
        {leftLabel}
      </motion.span>
      <motion.span style={{ opacity: rightLabelOpacity }} className={cn(LABEL_CLASS, 'right-3')}>
        {rightLabel}
      </motion.span>

      {/* Divider + handle (zero-width track so drag constraints span the full container) */}
      <motion.div
        ref={handleRef}
        data-ba-handle=""
        role="slider"
        tabIndex={0}
        aria-label={`مقایسه ${beforeLabel} و ${afterLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(start)}
        aria-valuetext={`${toPersianDigits(Math.round(start))}٪`}
        aria-orientation="horizontal"
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={markInteracted}
        onDrag={clampDrag}
        onKeyDown={onKeyDown}
        style={{ x, left: `${start}%` }}
        className="absolute inset-y-0 w-0 cursor-ew-resize touch-pan-y outline-hidden"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_6px_rgba(0,0,0,0.45)]"
        />
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        >
          {showPulse && (
            <motion.span
              className="absolute inset-2 rounded-full border-2 border-secondary"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
            />
          )}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-glow-secondary ring-2 ring-secondary backdrop-blur-sm transition-transform duration-200 group-active:scale-95 group-focus-within:ring-4">
            <ChevronsLeftRight className="h-5 w-5" />
          </span>
        </span>
      </motion.div>
    </div>
  );
}
