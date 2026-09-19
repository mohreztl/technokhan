'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useIsCoarsePointer } from '@/lib/hooks/use-media-query';

/**
 * Shared gate for decorative motion: animate only while in view, never for
 * reduced-motion users, and never on touch devices (where large blurred
 * layers are expensive) — those get a static radial gradient instead.
 */
function useAmbientGate(ref: React.RefObject<HTMLElement | null>) {
  const inView = useInView(ref, { margin: '-15%' });
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  return { isStatic: coarse || reduced, animate: inView && !reduced && !coarse };
}

interface Orb {
  className: string;
  keyframes: { x?: number[]; y?: number[]; scale?: number[]; opacity?: number[] };
  rest: number;
  duration: number;
}

const HERO_ORBS: Orb[] = [
  {
    className:
      'top-[10%] -inset-e-24 h-104 w-104 bg-linear-to-br from-secondary/25 via-secondary/10 to-transparent',
    keyframes: { scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35], x: [0, -40, 0] },
    rest: 0.4,
    duration: 16,
  },
  {
    className:
      '-bottom-24 -inset-s-24 h-120 w-120 bg-linear-to-tr from-primary/40 via-primary/15 to-transparent',
    keyframes: { scale: [1.2, 1, 1.2], opacity: [0.45, 0.25, 0.45], y: [0, 40, 0] },
    rest: 0.35,
    duration: 20,
  },
];

const SECTION_ORBS: Orb[] = [
  {
    className:
      'top-0 inset-e-[10%] h-96 w-[24rem] bg-linear-to-br from-primary/20 to-transparent',
    keyframes: { y: [0, 40, 0], opacity: [0.3, 0.5, 0.3] },
    rest: 0.3,
    duration: 12,
  },
  {
    className:
      'bottom-0 inset-s-[10%] h-88 w-88 bg-linear-to-tr from-secondary/20 to-transparent',
    keyframes: { y: [0, -30, 0], scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3] },
    rest: 0.3,
    duration: 14,
  },
];

const STATIC_BACKGROUND: Record<'hero' | 'section', string> = {
  hero:
    'radial-gradient(40rem 30rem at 90% 15%, hsl(var(--secondary) / 0.18), transparent 60%), radial-gradient(44rem 34rem at 5% 95%, hsl(var(--primary) / 0.35), transparent 60%)',
  section:
    'radial-gradient(30rem 24rem at 85% 0%, hsl(var(--primary) / 0.14), transparent 60%), radial-gradient(28rem 22rem at 10% 100%, hsl(var(--secondary) / 0.14), transparent 60%)',
};

export interface AmbientOrbsProps {
  variant?: 'hero' | 'section';
  className?: string;
}

/** Soft navy/gold orbs that drift only while on screen (static gradient on touch / reduced motion). */
export function AmbientOrbs({ variant = 'section', className }: AmbientOrbsProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { isStatic, animate } = useAmbientGate(ref);
  const orbs = variant === 'hero' ? HERO_ORBS : SECTION_ORBS;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {isStatic ? (
        <div className="absolute inset-0" style={{ background: STATIC_BACKGROUND[variant] }} />
      ) : (
        orbs.map((orb, i) => (
          <motion.div
            key={i}
            className={cn('absolute rounded-full blur-3xl', orb.className)}
            initial={{ opacity: orb.rest, scale: 1 }}
            animate={animate ? orb.keyframes : { opacity: orb.rest, scale: 1, x: 0, y: 0 }}
            transition={
              animate
                ? { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.8 }
            }
          />
        ))
      )}
    </div>
  );
}

export interface GoldLinesProps {
  className?: string;
}

/** Two thin gold light streaks travelling across the section (static on touch / reduced motion). */
export function GoldLines({ className }: GoldLinesProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { isStatic, animate } = useAmbientGate(ref);

  const lines = [
    { top: '22%', duration: 9, delay: 0, from: '-40%', to: '140%' },
    { top: '78%', duration: 12, delay: 3, from: '140%', to: '-40%' },
  ];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {lines.map((line, i) =>
        isStatic ? (
          <div
            key={i}
            className="absolute h-px w-[40%] bg-linear-to-r from-transparent via-secondary/40 to-transparent"
            style={{ top: line.top, insetInlineStart: i === 0 ? '10%' : '50%' }}
          />
        ) : (
          <motion.div
            key={i}
            className="absolute h-px w-[30%] bg-linear-to-r from-transparent via-secondary/60 to-transparent"
            style={{ top: line.top, left: 0 }}
            initial={{ x: line.from, opacity: 0 }}
            animate={animate ? { x: [line.from, line.to], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
            transition={
              animate
                ? {
                    duration: line.duration,
                    delay: line.delay,
                    repeat: Infinity,
                    ease: 'linear',
                    times: [0, 0.1, 0.9, 1],
                  }
                : { duration: 0.4 }
            }
          />
        )
      )}
    </div>
  );
}

const BLOBS: Orb[] = [
  {
    className: 'top-1/4 -inset-s-20 h-96 w-96 bg-primary/10',
    keyframes: { x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] },
    rest: 1,
    duration: 20,
  },
  {
    className: 'top-1/2 -inset-e-20 h-80 w-80 bg-secondary/15',
    keyframes: { x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.3, 1] },
    rest: 1,
    duration: 25,
  },
  {
    className: 'bottom-1/4 inset-s-1/3 h-72 w-72 bg-accent/5',
    keyframes: { x: [0, 60, 0], y: [0, -60, 0], scale: [1, 1.1, 1] },
    rest: 1,
    duration: 15,
  },
];

/** Gated morphing blob background (animates in view only; static gradient on touch). */
export function MorphingBlobs({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { isStatic, animate } = useAmbientGate(ref);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {isStatic ? (
        <div className="absolute inset-0" style={{ background: STATIC_BACKGROUND.section }} />
      ) : (
        BLOBS.map((blob, i) => (
          <motion.div
            key={i}
            className={cn('absolute rounded-full blur-3xl', blob.className)}
            animate={animate ? blob.keyframes : { x: 0, y: 0, scale: 1 }}
            transition={
              animate
                ? { duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.8 }
            }
          />
        ))
      )}
    </div>
  );
}
