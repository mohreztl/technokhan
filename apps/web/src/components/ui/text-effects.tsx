'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[1em] bg-current ml-1 align-middle"
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={cn('relative h-[1.2em] overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 40, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, rotateX: 90 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/**
 * Split Text Animation - انیمیشن متن تکه تکه
 */
export function SplitText({
  text,
  className,
  charClassName,
  delay = 0,
  stagger = 0.03,
  animation = 'fadeUp',
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  animation?: 'fadeUp' | 'fadeDown' | 'blur' | 'scale' | 'wave';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const animations = {
    fadeUp: {
      initial: { y: 30, opacity: 0 },
      animate: { y: 0, opacity: 1 },
    },
    fadeDown: {
      initial: { y: -30, opacity: 0 },
      animate: { y: 0, opacity: 1 },
    },
    blur: {
      initial: { filter: 'blur(10px)', opacity: 0 },
      animate: { filter: 'blur(0px)', opacity: 1 },
    },
    scale: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
    },
    wave: {
      initial: { y: 0 },
      animate: (i: number) => ({
        y: [0, -10, 0],
        transition: {
          duration: 0.5,
          delay: delay + i * stagger,
          repeat: Infinity,
          repeatDelay: 2,
        },
      }),
    },
  };

  const selectedAnimation = animations[animation];

  return (
    <span ref={ref} className={cn('inline-flex flex-wrap', className)}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className={cn('inline-block', charClassName, char === ' ' && 'w-[0.3em]')}
          initial={selectedAnimation.initial}
          animate={
            isInView
              ? typeof selectedAnimation.animate === 'function'
                ? selectedAnimation.animate(i)
                : selectedAnimation.animate
              : selectedAnimation.initial
          }
          transition={{
            duration: 0.5,
            delay: delay + i * stagger,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {char === ' ' ? '\u00A0' : char}
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
  revealSpeed = 50,
  trigger = 'hover',
}: {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  revealSpeed?: number;
  trigger?: 'hover' | 'inView' | 'immediate';
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = text.length * 3;

    const interval = setInterval(() => {
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
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, scrambleSpeed);
  };

  useEffect(() => {
    if (trigger === 'immediate') {
      scramble();
    }
  }, []);

  useEffect(() => {
    if (trigger === 'inView' && isInView) {
      scramble();
    }
  }, [isInView, trigger]);

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

/**
 * Counter Animation - شمارنده متحرک
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

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function (easeOutExpo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(eased * value);

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
        className={cn(
          'absolute inset-0 bg-secondary/30 -z-10',
          highlightClassName
        )}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ transformOrigin: 'left' }}
      />
      {children}
    </span>
  );
}
