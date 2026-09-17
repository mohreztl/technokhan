'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Luxury Card - کارت لوکس با افکت شاین
 */
export function LuxuryCard({
  children,
  className,
  shimmer = true,
}: {
  children: React.ReactNode;
  className?: string;
  shimmer?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-white/10 via-white/5 to-transparent',
        'backdrop-blur-xl border border-white/20',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
        'group',
        className
      )}
    >
      {/* Shimmer Effect */}
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      )}

      {/* Gold Border Glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-br from-secondary/50 via-secondary/20 to-secondary/50 blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Gold Badge - نشان طلایی
 */
export function GoldBadge({
  children,
  className,
  size = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        'bg-gradient-to-r from-secondary-400 via-secondary-300 to-secondary-400',
        'text-primary-900',
        'shadow-[0_2px_10px_rgba(194,178,128,0.4)]',
        'border border-secondary-200/50',
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Premium Button - دکمه پریمیوم
 */
export function PremiumButton({
  children,
  className,
  variant = 'gold',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'gold' | 'navy' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const variants = {
    gold: cn(
      'bg-gradient-to-r from-secondary-500 via-secondary-400 to-secondary-500',
      'text-primary-900 font-bold',
      'shadow-[0_4px_20px_rgba(194,178,128,0.4)]',
      'hover:shadow-[0_6px_30px_rgba(194,178,128,0.6)]',
      'border border-secondary-300/50'
    ),
    navy: cn(
      'bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800',
      'text-white font-bold',
      'shadow-[0_4px_20px_rgba(0,31,63,0.4)]',
      'hover:shadow-[0_6px_30px_rgba(0,31,63,0.6)]',
      'border border-primary-600/50'
    ),
    glass: cn(
      'bg-white/10 backdrop-blur-md',
      'text-white font-medium',
      'border border-white/20',
      'hover:bg-white/20'
    ),
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative overflow-hidden rounded-xl transition-all duration-300',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer overlay (driven by the button's hover via `group-hover`, not the span's own hover) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/**
 * Divider with Logo - خط جداکننده با لوگو
 */
export function LuxuryDivider({
  className,
  icon,
}: {
  className?: string;
  icon?: React.ReactNode;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={cn('flex items-center gap-4 my-8', className)}>
      <motion.div
        className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary/50 to-secondary/50"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
      {icon && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-secondary"
        >
          {icon}
        </motion.div>
      )}
      <motion.div
        className="flex-1 h-px bg-gradient-to-r from-secondary/50 via-secondary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8 }}
        style={{ transformOrigin: 'right' }}
      />
    </div>
  );
}

/**
 * Stats Card - کارت آمار
 */
export function StatsCard({
  value,
  label,
  icon,
  suffix = '',
  className,
}: {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative p-6 rounded-2xl text-center',
        'bg-gradient-to-br from-primary/5 to-primary/10',
        'border border-primary/10',
        'group hover:border-secondary/30 transition-colors',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <div className="mb-3 flex justify-center text-secondary group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="text-4xl font-bold text-primary mb-1">
        {value}
        {suffix && <span className="text-secondary text-2xl">{suffix}</span>}
      </div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </motion.div>
  );
}

/**
 * Testimonial Card - کارت نظر مشتری
 */
export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating,
  className,
}: {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}) {
  return (
    <LuxuryCard className={cn('p-6', className)}>
      {/* Quote Icon */}
      <svg
        className="w-10 h-10 text-secondary/30 mb-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      {/* Rating */}
      {rating && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={cn(
                'w-5 h-5',
                i < rating ? 'text-secondary' : 'text-muted-foreground/30'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}

      {/* Quote */}
      <p className="text-foreground/80 mb-6 leading-relaxed">{quote}</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover border-2 border-secondary/30"
          />
        )}
        <div>
          <div className="font-semibold text-foreground">{author}</div>
          {role && <div className="text-sm text-muted-foreground">{role}</div>}
        </div>
      </div>
    </LuxuryCard>
  );
}

/**
 * Section Heading - عنوان سکشن (با برچسب طلایی اختیاری)
 */
export function SectionHeading({
  title,
  subtitle,
  badge,
  eyebrow,
  align = 'center',
  as: Heading = 'h2',
  id,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Pill badge above the title (gold gradient). */
  badge?: string;
  /** Small gold uppercase-style label above the title. */
  eyebrow?: string;
  /** Logical alignment; `left`/`right` are kept for backwards compatibility. */
  align?: 'start' | 'center' | 'end' | 'left' | 'right';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const alignClasses: Record<NonNullable<typeof align>, string> = {
    start: 'text-start',
    left: 'text-start',
    center: 'text-center',
    end: 'text-end',
    right: 'text-end',
  };
  const centered = align === 'center';
  const MotionHeading = motion[Heading];

  return (
    <div ref={ref} className={cn(alignClasses[align], 'mb-10 lg:mb-14', className)}>
      {eyebrow && (
        <motion.p
          className={cn(
            'mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-secondary',
            centered && 'justify-center'
          )}
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          <span aria-hidden="true" className="h-px w-6 bg-secondary/70" />
          {eyebrow}
          {centered && <span aria-hidden="true" className="h-px w-6 bg-secondary/70" />}
        </motion.p>
      )}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          <GoldBadge className="mb-4">{badge}</GoldBadge>
        </motion.div>
      )}
      <MotionHeading
        id={id}
        className="mb-3 text-balance text-2xl font-black text-foreground sm:text-3xl md:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </MotionHeading>
      {subtitle && (
        <motion.p
          className={cn(
            'max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg',
            centered && 'mx-auto'
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
