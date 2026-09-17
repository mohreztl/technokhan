'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsCoarsePointer } from '@/lib/hooks/use-media-query';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rotationIntensity?: number;
  shadowIntensity?: number;
}

/**
 * 3D Tilt Card - کارت با افکت چرخش ۳D (pointer devices only)
 */
export function Card3D({
  children,
  className,
  containerClassName,
  rotationIntensity = 10,
  shadowIntensity = 0.3,
}: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const coarse = useIsCoarsePointer();
  const reduced = useReducedMotion();
  const tiltEnabled = !coarse && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${rotationIntensity}deg`, `-${rotationIntensity}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${rotationIntensity}deg`, `${rotationIntensity}deg`]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !tiltEnabled) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={containerClassName} style={{ perspective: '1000px' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          tiltEnabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined
        }
        className={cn('relative transition-shadow duration-500', className)}
      >
        {tiltEnabled && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-2xl bg-black/20 blur-xl"
            style={{ rotateX, rotateY, translateZ: '-50px', opacity: shadowIntensity }}
          />
        )}
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Floating Card - کارت شناور (only floats while on screen)
 */
export function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10%' });
  const reduced = useReducedMotion();
  const active = inView && !reduced;

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={active ? { y: [0, -10, 0] } : { y: 0 }}
      transition={
        active ? { duration: 4, repeat: Infinity, ease: 'easeInOut', delay } : { duration: 0.4 }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Magnetic Button - دکمه مغناطیسی
 */
export function MagneticButton({
  children,
  className,
  magneticStrength = 0.3,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'style'>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const coarse = useIsCoarsePointer();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || coarse) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setPosition({
      x: (e.clientX - centerX) * magneticStrength,
      y: (e.clientY - centerY) * magneticStrength,
    });
  };

  const { onAnimationStart, onDragStart, onDrag, onDragEnd, ...buttonProps } = props as any;

  return (
    <motion.button
      ref={ref}
      type="button"
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      {...buttonProps}
    >
      {children}
    </motion.button>
  );
}

/**
 * Parallax Section - سکشن با افکت پارالکس (scroll-linked motion value, no state)
 */
export function ParallaxSection({
  children,
  className,
  speed = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Reveal on Scroll - نمایش با اسکرول
 */
export function RevealOnScroll({
  children,
  className,
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}) {
  const directionVariants = {
    up: { y: 60, opacity: 0 },
    down: { y: -60, opacity: 0 },
    left: { x: 60, opacity: 0 },
    right: { x: -60, opacity: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={directionVariants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
