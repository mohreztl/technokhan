'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Custom Cursor - کرسور سفارشی
 */
export function CustomCursor({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-hover')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    document.querySelectorAll('a, button, .cursor-hover').forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter as EventListener);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className={cn(
          'fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference',
          !isVisible && 'opacity-0',
          className
        )}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="bg-white rounded-full"
          animate={{
            width: isClicking ? 8 : isHovering ? 40 : 12,
            height: isClicking ? 8 : isHovering ? 40 : 12,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Trailing ring */}
      <motion.div
        className={cn(
          'fixed top-0 left-0 pointer-events-none z-[9998]',
          !isVisible && 'opacity-0'
        )}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="border-2 border-secondary/50 rounded-full"
          animate={{
            width: isHovering ? 60 : 40,
            height: isHovering ? 60 : 40,
            opacity: isClicking ? 0.3 : 0.5,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </>
  );
}

/**
 * Ripple Effect Button - دکمه با افکت ریپل
 */
export function RippleButton({
  children,
  className,
  rippleColor = 'rgba(255,255,255,0.5)',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);

    props.onClick?.(e);
  };

  return (
    <button
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
            animate={{ width: 500, height: 500, x: -250, y: -250, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

/**
 * Hover Reveal - نمایش با هاور
 */
export function HoverReveal({
  children,
  revealContent,
  className,
}: {
  children: React.ReactNode;
  revealContent: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: isHovering
            ? `circle(100px at ${mousePosition.x}px ${mousePosition.y}px)`
            : `circle(0px at ${mousePosition.x}px ${mousePosition.y}px)`,
        }}
        transition={{ duration: 0.3 }}
      >
        {revealContent}
      </motion.div>
    </div>
  );
}

/**
 * Magnetic Link - لینک مغناطیسی
 */
export function MagneticLink({
  children,
  href,
  className,
  strength = 0.5,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={cn('inline-block', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
    >
      {children}
    </motion.a>
  );
}

/**
 * Tilt Image - تصویر با افکت کجی
 */
export function TiltImage({
  src,
  alt,
  className,
  containerClassName,
  maxTilt = 15,
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setTilt({
      x: (y - 0.5) * maxTilt * 2,
      y: (x - 0.5) * -maxTilt * 2,
    });
    setGlare({
      x: x * 100,
      y: y * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      className={cn('relative perspective-1000', containerClassName)}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img src={src} alt={alt} className={cn('rounded-2xl', className)} />
        {/* Glare effect */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
          }}
        />
      </motion.div>
    </div>
  );
}

/**
 * Scroll Progress - نوار پیشرفت اسکرول
 */
export function ScrollProgress({
  className,
  color = 'bg-secondary',
}: {
  className?: string;
  color?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn('fixed top-0 left-0 right-0 h-1 z-50', className)}>
      <motion.div
        className={cn('h-full', color)}
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
