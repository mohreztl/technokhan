'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatNumberFa, toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export interface RollingNumberProps {
  value: number;
  className?: string;
  /** custom formatter; defaults to fa-IR grouping with Persian digits ("۱٬۲۵۰٬۰۰۰") */
  format?: (n: number) => string;
  stiffness?: number;
  damping?: number;
}

const defaultFormat = (n: number) => toPersianDigits(formatNumberFa(n));

/**
 * Spring-driven rolling number rendered straight from a MotionValue
 * (no React re-renders while it animates). Screen readers get the final value.
 */
export function RollingNumber({
  value,
  className,
  format = defaultFormat,
  stiffness = 90,
  damping = 22,
}: RollingNumberProps) {
  const reduced = useReducedMotion();
  const spring = useSpring(value, { stiffness, damping, mass: 0.8 });
  const text = useTransform(spring, (v) => format(Math.round(v)));

  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, reduced, spring]);

  return (
    <span className={cn('inline-block', className)}>
      <motion.span aria-hidden="true" className="tabular-nums">
        {text}
      </motion.span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
