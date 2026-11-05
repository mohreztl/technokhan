'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { ServiceStep } from '@technokhan/shared';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { resolveIcon } from './icon-map';

export type TimelineOrientation = 'auto' | 'vertical' | 'horizontal';

export interface ProcessTimelineProps {
  steps: ServiceStep[];
  title?: string;
  className?: string;
  /** 'auto' = vertical below lg, horizontal at lg+ */
  orientation?: TimelineOrientation;
  /** document direction; mirrors the horizontal path so it draws from the first step */
  dir?: 'rtl' | 'ltr';
}

// Gentle S-curves. Both are stretched with preserveAspectRatio="none" + non-scaling strokes.
const V_PATH = 'M50 0C90 200 10 400 50 600S90 900 50 1000';
const H_PATH = 'M0 50C200 10 400 90 600 50S900 90 1000 50';

const NODE = 56; // px, matches h-14/w-14

function TimelineNode({
  step,
  index,
  count,
  progress,
  orientation,
}: {
  step: ServiceStep;
  index: number;
  count: number;
  progress: MotionValue<number>;
  orientation: TimelineOrientation;
}) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const lit = useTransform(progress, [Math.max(0, t - 0.15), Math.max(t, 0.001)], [0, 1]);
  const unlit = useTransform(lit, [0, 1], [1, 0]);
  const scale = useTransform(lit, [0, 1], [0.92, 1.06]);
  const glow = useTransform(
    lit,
    (v) => `0 0 ${Math.round(v * 26)}px rgba(194,178,128,${(v * 0.6).toFixed(2)})`
  );
  const textOpacity = useTransform(lit, [0, 1], [0.55, 1]);
  const Icon = resolveIcon(step.icon);

  return (
    <li
      className={cn(
        'relative flex gap-4',
        orientation === 'horizontal' && 'flex-col items-center gap-3 text-center',
        orientation === 'vertical' && 'items-start',
        orientation === 'auto' && 'items-start lg:flex-col lg:items-center lg:gap-3 lg:text-center'
      )}
    >
      <motion.div
        style={{ scale, boxShadow: glow }}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-border/60"
      >
        <motion.span
          aria-hidden="true"
          style={{ opacity: lit }}
          className="absolute inset-0 rounded-full bg-secondary ring-2 ring-secondary"
        />
        <motion.span style={{ opacity: unlit }} className="relative text-foreground/70">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          style={{ opacity: lit }}
          className="absolute inset-0 flex items-center justify-center text-primary-500"
        >
          <Icon className="h-6 w-6" />
        </motion.span>
        <span className="absolute -inset-s-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground ring-1 ring-border">
          {toPersianDigits(index + 1)}
        </span>
      </motion.div>

      <motion.div style={{ opacity: textOpacity }} className="min-w-0 pt-1 lg:pt-0">
        <h3 className="text-base font-bold text-foreground">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        {step.durationLabel && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-secondary">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {toPersianDigits(step.durationLabel)}
          </span>
        )}
      </motion.div>
    </li>
  );
}

/**
 * Scroll-drawn process timeline: a curved gold path whose `pathLength` follows
 * `useScroll` over the list; each node lights up as the line reaches it.
 * Reduced motion: fully drawn, everything lit.
 */
export function ProcessTimeline({
  steps,
  title,
  className,
  orientation = 'auto',
  dir = 'rtl',
}: ProcessTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 20%'] });
  const full = useMotionValue(1);
  const progress = reduced ? full : scrollYProgress;

  const n = steps.length;
  const showV = orientation !== 'horizontal';
  const showH = orientation !== 'vertical';
  const halfCol = `calc(50% / ${Math.max(n, 1)})`;

  return (
    <section ref={ref} className={cn('relative', className)} aria-label={title ?? 'مراحل انجام کار'}>
      {title && <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>}

      {n === 0 ? (
        <p className="text-sm text-muted-foreground">مراحل انجام این خدمت به‌زودی اضافه می‌شود.</p>
      ) : (
        <div className="relative">
          {showV && (
            <svg
              aria-hidden="true"
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              className={cn(
                'pointer-events-none absolute inset-s-0 w-14',
                orientation === 'auto' && 'lg:hidden'
              )}
              style={{ top: NODE / 2, bottom: NODE / 2 }}
            >
              <path
                d={V_PATH}
                fill="none"
                stroke="hsl(var(--border) / 0.5)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={V_PATH}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: progress }}
              />
            </svg>
          )}
          {showH && (
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              className={cn(
                'pointer-events-none absolute top-0 h-14',
                orientation === 'auto' && 'hidden lg:block'
              )}
              style={{
                left: halfCol,
                right: halfCol,
                transform: dir === 'rtl' ? 'scaleX(-1)' : undefined,
              }}
            >
              <path
                d={H_PATH}
                fill="none"
                stroke="hsl(var(--border) / 0.5)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={H_PATH}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: progress }}
              />
            </svg>
          )}

          <ol
            className={cn(
              'relative',
              orientation === 'vertical' && 'flex flex-col gap-8',
              orientation === 'horizontal' && 'grid auto-cols-fr grid-flow-col gap-6',
              orientation === 'auto' && 'flex flex-col gap-8 lg:grid lg:auto-cols-fr lg:grid-flow-col lg:gap-6'
            )}
          >
            {steps.map((step, i) => (
              <TimelineNode
                key={`${i}-${step.title}`}
                step={step}
                index={i}
                count={n}
                progress={progress}
                orientation={orientation}
              />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
