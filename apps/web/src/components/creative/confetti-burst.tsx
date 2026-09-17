'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export interface ConfettiBurstProps {
  /** rising edge (false → true) fires one burst */
  fire: boolean;
  colors?: string[];
  count?: number;
  /** burst origin as a fraction of the container (0–1) */
  origin?: { x: number; y: number };
  /** cover the viewport instead of the nearest positioned parent */
  fixed?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  color: string;
  dx: number;
  dy: number;
  rot: number;
  size: number;
  delay: number;
  round: boolean;
}

/** navy, gold, white */
const DEFAULT_COLORS = ['#001F3F', '#C2B280', '#FFFFFF'];
const LIFETIME_MS = 1600;

/**
 * 30 light `motion.span` particles fanning upward then falling; unmounts itself after 1.6s.
 * Parent should be `relative` (unless `fixed`). No-op under reduced motion.
 */
export function ConfettiBurst({
  fire,
  colors = DEFAULT_COLORS,
  count = 30,
  origin = { x: 0.5, y: 0.4 },
  fixed = false,
  className,
}: ConfettiBurstProps) {
  const reduced = useReducedMotion();
  const [burst, setBurst] = useState<{ key: number; particles: Particle[] } | null>(null);
  const prevFire = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rising = fire && !prevFire.current;
    prevFire.current = fire;
    if (!rising || reduced) return;

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4; // mostly upward fan
      const dist = 90 + Math.random() * 180;
      return {
        id: i,
        color: colors[i % colors.length],
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 720,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.12,
        round: Math.random() > 0.6,
      };
    });
    setBurst({ key: Date.now(), particles });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBurst(null), LIFETIME_MS);
  }, [fire, reduced, count, colors]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (!burst || reduced) return null;

  return (
    <div
      key={burst.key}
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-0 z-50 overflow-hidden',
        fixed ? 'fixed' : 'absolute',
        className
      )}
    >
      {burst.particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          style={{
            left: `${origin.x * 100}%`,
            top: `${origin.y * 100}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
          initial={{ x: 0, y: 0, scale: 0.6, rotate: 0, opacity: 1 }}
          animate={{
            x: [0, p.dx * 0.7, p.dx],
            y: [0, p.dy, p.dy + 160],
            scale: [0.6, 1, 0.9],
            rotate: [0, p.rot * 0.6, p.rot],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut', times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}
