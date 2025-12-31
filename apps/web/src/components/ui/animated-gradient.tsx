'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Animated Gradient Border - افکت حاشیه متحرک گرادیانت
 */
export function AnimatedGradientBorder({
  children,
  className,
  containerClassName,
}: AnimatedGradientProps) {
  return (
    <div className={cn('relative group', containerClassName)}>
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl opacity-60 group-hover:opacity-100 blur transition-all duration-500"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <div className={cn('relative bg-background rounded-2xl', className)}>
        {children}
      </div>
    </div>
  );
}

/**
 * Animated Gradient Text - متن با گرادیانت متحرک
 */
export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={cn(
        'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent',
        className
      )}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundSize: '200% 200%',
      }}
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
          'absolute inset-0 bg-gradient-radial blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700',
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
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card border border-border',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
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
 * Morphing Blob Background - پس‌زمینه حباب‌های متحرک
 */
export function MorphingBlobs({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden -z-10', className)}>
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 -right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

/**
 * Noise Texture Overlay - بافت نویز
 */
export function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}
