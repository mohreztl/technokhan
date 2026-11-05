'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView, type Target, type TargetAndTransition } from 'framer-motion';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

/**
 * Typewriter Effect - افکت ماشین تایپ
 */
export function TypewriterText({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
  onComplete,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ms-1 inline-block h-[1em] w-[3px] bg-current align-middle"
        />
      )}
    </span>
  );
}

/**
 * Rotating Text - متن چرخشی
 */
export function RotatingText({
  texts,
  className,
  interval = 3000,
}: {
  texts: string[];
  className?: string;
  interval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval, isInView]);

  return (
    <div ref={ref} className={cn('relative h-[1.2em] overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 40, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export type SplitTextAnimation = 'fadeUp' | 'fadeDown' | 'blur' | 'scale' | 'wave';

/**
 * Split Text Animation - انیمیشن متن تکه تکه
 *
 * Defaults to splitting by **word**: per-character spans break the joining
 * forms of Persian/Arabic glyphs, so `char` mode is only for Latin text.
 */
export function SplitText({
  immediate = false,
  text,
  className,
  charClassName,
  delay = 0,
  stagger = 0.03,
  animation = 'fadeUp',
  splitBy = 'word',
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  animation?: SplitTextAnimation;
  /** Animate on mount instead of waiting for the viewport (use for above-the-fold text such as the hero title). */
  immediate?: boolean;
  splitBy?: 'word' | 'char';
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: animation !== 'wave', margin: '-50px' });
  const isInView = immediate || inView;
  const reduced = useReducedMotion();

  const units = splitBy === 'word' ? text.split(/\s+/).filter(Boolean) : text.split('');

  const animations: Record<
    SplitTextAnimation,
    { initial: Target; animate: TargetAndTransition | ((i: number) => TargetAndTransition) }
  > = {
    fadeUp: { initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    fadeDown: { initial: { y: -30, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    blur: { initial: { filter: 'blur(10px)', opacity: 0 }, animate: { filter: 'blur(0px)', opacity: 1 } },
    scale: { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
    wave: {
      initial: { y: 0 },
      animate: (i: number) => ({
        y: [0, -10, 0],
        transition: { duration: 0.5, delay: delay + i * stagger, repeat: Infinity, repeatDelay: 2 },
      }),
    },
  };

  const selected = animations[animation];

  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {text}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex flex-wrap justify-center',
        splitBy === 'word' ? 'gap-x-[0.28em]' : 'gap-x-0',
        className
      )}
    >
      <span className="sr-only">{text}</span>
      {units.map((unit, i) => (
        <motion.span
          key={`${unit}-${i}`}
          aria-hidden="true"
          className={cn('inline-block', charClassName, unit === ' ' && 'w-[0.3em]')}
          initial={selected.initial}
          animate={
            isInView
              ? typeof selected.animate === 'function'
                ? selected.animate(i)
                : selected.animate
              : selected.initial
          }
          transition={{ duration: 0.5, delay: delay + i * stagger, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {unit === ' ' ? ' ' : unit}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Scramble Text - متن رمزنگاری شده
 */
export function ScrambleText({
  text,
  className,
  scrambleSpeed = 30,
  trigger = 'hover',
}: {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  revealSpeed?: number;
  trigger?: 'hover' | 'inView' | 'immediate';
}) {
  const [displayText, setDisplayText] = useState(text);
  const scramblingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  const scramble = React.useCallback(() => {
    if (scramblingRef.current) return;
    scramblingRef.current = true;

    let iteration = 0;
    const maxIterations = text.length * 3;

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 3) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iteration++;
      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        scramblingRef.current = false;
      }
    }, scrambleSpeed);
  }, [text, scrambleSpeed, chars]);

  useEffect(() => {
    if (trigger === 'immediate' || (trigger === 'inView' && isInView)) scramble();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      scramblingRef.current = false;
    };
  }, [isInView, trigger, scramble]);

  return (
    <span
      ref={ref}
      className={cn('font-mono', className)}
      onMouseEnter={trigger === 'hover' ? scramble : undefined}
    >
      {displayText}
    </span>
  );
}

/** 1234567.8 -> "۱٬۲۳۴٬۵۶۷٫۸" */
export function formatCounterValue(value: number, decimals = 0): string {
  const [int, frac] = value.toFixed(decimals).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  return toPersianDigits(frac ? `${grouped}٫${frac}` : grouped);
}

/**
 * Counter Animation - شمارنده متحرک (ارقام فارسی)
 */
export function AnimatedCounter({
  value,
  className,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  // IntersectionObserver never fires in hidden documents (background tabs, some webviews):
  // settle on the final value after a grace period so the number is never stuck at 0.
  useEffect(() => {
    if (isInView) return;
    const t = setTimeout(() => setCount(value), Math.max(duration * 1000, 1500) + 500);
    return () => clearTimeout(t);
  }, [isInView, value, duration]);

  useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      setCount(value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const total = duration * 1000;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / total, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(eased * value);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, reduced]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)} dir="ltr">
      {prefix}
      {formatCounterValue(count, decimals)}
      {suffix}
    </span>
  );
}

/**
 * Highlight Text - هایلایت متن
 */
export function HighlightText({
  children,
  className,
  highlightClassName,
  delay = 0,
}: {
  children: string;
  className?: string;
  highlightClassName?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={cn('relative inline-block', className)}>
      <motion.span
        className={cn('absolute inset-0 -z-10 bg-secondary/30', highlightClassName)}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformOrigin: 'right' }}
      />
      {children}
    </span>
  );
}
