'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export { MorphingBlobs } from '@/components/ui/ambient';

interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const GRADIENT_KEYFRAMES = { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] };

/**
 * Animated Gradient Border - افکت حاشیه متحرک گرادیانت (animates in view only)
 */
export function AnimatedGradientBorder({
  children,
  className,
  containerClassName,
}: AnimatedGradientProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10%' });
  const reduced = useReducedMotion();
  const active = inView && !reduced;

  return (
    <div ref={ref} className={cn('group relative', containerClassName)}>
      <motion.div
        className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-primary via-secondary to-primary opacity-60 blur-sm transition-all duration-500 group-hover:opacity-100"
        animate={active ? GRADIENT_KEYFRAMES : { backgroundPosition: '0% 50%' }}
        transition={active ? { duration: 5, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
        style={{ backgroundSize: '200% 200%' }}
      />
      <div className={cn('relative rounded-2xl bg-background', className)}>{children}</div>
    </div>
  );
}

/**
 * Animated Gradient Text - متن با گرادیانت متحرک (animates in view only)
 */
export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: '-10%' });
  const reduced = useReducedMotion();
  const active = inView && !reduced;

  return (
    <motion.span
      ref={ref}
      className={cn(
        'bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent',
        className
      )}
      animate={active ? GRADIENT_KEYFRAMES : { backgroundPosition: '0% 50%' }}
      transition={active ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
      style={{ backgroundSize: '200% 200%' }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Glow Effect - افکت درخشش
 */
export function GlowEffect({
  children,
  className,
  glowColor = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'primary' | 'secondary' | 'accent';
}) {
  const glowColors = {
    primary: 'from-primary/20 via-primary/10 to-transparent',
    secondary: 'from-secondary/30 via-secondary/15 to-transparent',
    accent: 'from-accent/20 via-accent/10 to-transparent',
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 bg-gradient-radial opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100',
          glowColors[glowColor]
        )}
      />
      {children}
    </div>
  );
}

/**
 * Spotlight Effect - افکت نور متحرک
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl border border-border bg-card', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, hsl(var(--secondary) / 0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

/**
 * Noise Texture Overlay - بافت نویز
 */
export function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}
