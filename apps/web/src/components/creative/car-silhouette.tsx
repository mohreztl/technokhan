'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import type { WrapFinish } from '@technokhan/shared';
import { cn } from '@/lib/utils';

export const CAR_VIEWBOX = '0 0 640 260';

/** Side profile of a modern sedan facing left. All coordinates live in the 640×260 viewBox. */
export const CAR_BODY_PATH =
  'M36 178C36 158 48 146 70 142L130 132C170 124 210 120 245 118C265 92 285 78 312 72C350 64 405 62 438 66C470 70 505 96 540 116L588 122C606 126 614 148 612 176L608 210H542A52 52 0 0 0 438 210H202A52 52 0 0 0 98 210H46C36 210 34 194 36 178Z';

const WINDOW_FRONT = 'M262 118C278 96 296 84 318 80L364 77L362 118Z';
const WINDOW_REAR = 'M380 77L436 75C466 80 498 100 526 118H382Z';
const MIRROR = 'M258 108L276 101L280 112L262 117Z';
const HEADLIGHT = 'M50 150L96 142L100 158L56 168Z';
const TAILLIGHT = 'M592 130L611 138L610 166L596 162Z';
const DOOR_SEAMS = 'M262 124L258 208M372 120L368 208M528 124L522 208';

function spokes(cx: number, cy: number): string {
  return [0, 72, 144, 216, 288]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const x1 = (cx + 8 * Math.cos(a)).toFixed(1);
      const y1 = (cy + 8 * Math.sin(a)).toFixed(1);
      const x2 = (cx + 23 * Math.cos(a)).toFixed(1);
      const y2 = (cy + 23 * Math.sin(a)).toFixed(1);
      return `M${x1} ${y1}L${x2} ${y2}`;
    })
    .join('');
}

const SPOKES_FRONT = spokes(150, 205);
const SPOKES_REAR = spokes(490, 205);

export interface CarSilhouetteProps {
  /** body paint colour (any CSS colour) */
  color: string;
  finish?: WrapFinish;
  /** run the chrome shine sweep — gate it with `useInView` so it never runs off-screen */
  shine?: boolean;
  /** spring the colour change (default true) */
  animated?: boolean;
  className?: string;
  /** accessible name; omit to hide the graphic from AT */
  title?: string;
}

const COLOR_SPRING = { type: 'spring', stiffness: 110, damping: 24 } as const;

/**
 * Lightweight inline SVG sedan (~2KB, no <filter>). The body is a motion.path so
 * colour changes spring between values; finish overlays are gradient rects clipped to the body.
 */
export function CarSilhouette({
  color,
  finish = 'gloss',
  shine = false,
  animated = true,
  className,
  title,
}: CarSilhouetteProps) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `car-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const transition = animated ? COLOR_SPRING : { duration: 0 };

  return (
    <svg
      viewBox={CAR_VIEWBOX}
      className={cn('block h-auto w-full', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={id('body')}>
          <path d={CAR_BODY_PATH} />
        </clipPath>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={id('satin')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={id('matte')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={id('chrome')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.3" stopColor="#f2f2f2" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#3a3a3a" stopOpacity="0.75" />
          <stop offset="0.62" stopColor="#d9d9d9" stopOpacity="0.5" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8a8a8a" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id('stripe')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset="1" stopColor="#9a9a9a" />
        </linearGradient>
        <radialGradient id={id('floor')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx="322" cy="250" rx="300" ry="9" fill={url('floor')} />

      {/* body */}
      <motion.path
        d={CAR_BODY_PATH}
        initial={false}
        animate={{ fill: color }}
        transition={transition}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* finish overlays, clipped to the body */}
      <g clipPath={url('body')}>
        {finish === 'gloss' && (
          <>
            <rect width="640" height="260" fill={url('gloss')} />
            <polygon points="150,0 250,0 110,260 10,260" fill={url('stripe')} opacity="0.45" />
          </>
        )}
        {finish === 'satin' && <rect width="640" height="260" fill={url('satin')} />}
        {finish === 'matte' && (
          <>
            <rect width="640" height="260" fill="#9a9a9a" opacity="0.2" />
            <rect width="640" height="260" fill={url('matte')} />
          </>
        )}
        {finish === 'chrome' && (
          <>
            <rect width="640" height="260" fill={url('chrome')} />
            {shine && (
              <motion.g
                initial={{ x: -320 }}
                animate={{ x: 760 }}
                transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.6 }}
              >
                <polygon points="0,0 90,0 -60,260 -150,260" fill={url('stripe')} opacity="0.9" />
              </motion.g>
            )}
          </>
        )}
      </g>

      {/* glass */}
      <path d={WINDOW_FRONT} fill="#0e1a2b" opacity="0.92" />
      <path d={WINDOW_REAR} fill="#0e1a2b" opacity="0.92" />
      <path
        d="M276 112C288 96 302 88 318 85"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M396 82L490 100"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* mirror, seams, handles */}
      <motion.path
        d={MIRROR}
        initial={false}
        animate={{ fill: color }}
        transition={transition}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1"
      />
      <path d={DOOR_SEAMS} fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
      <rect x="312" y="148" width="24" height="6" rx="3" fill="rgba(0,0,0,0.35)" />
      <rect x="450" y="148" width="24" height="6" rx="3" fill="rgba(0,0,0,0.35)" />
      <path d="M40 188L96 186" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" />

      {/* lights */}
      <path d={HEADLIGHT} fill="#f6f2dc" opacity="0.95" />
      <path d="M56 152L88 146L90 152L58 158Z" fill="#fff" />
      <path d={TAILLIGHT} fill="#c0222c" opacity="0.92" />

      {/* wheels */}
      <g>
        <circle cx="150" cy="205" r="44" fill="#151515" />
        <circle cx="150" cy="205" r="27" fill={url('rim')} stroke="#6a6a6a" strokeWidth="1" />
        <path d={SPOKES_FRONT} stroke="#6f6f6f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="150" cy="205" r="6" fill="#4a4a4a" />
      </g>
      <g>
        <circle cx="490" cy="205" r="44" fill="#151515" />
        <circle cx="490" cy="205" r="27" fill={url('rim')} stroke="#6a6a6a" strokeWidth="1" />
        <path d={SPOKES_REAR} stroke="#6f6f6f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="490" cy="205" r="6" fill="#4a4a4a" />
      </g>
    </svg>
  );
}
