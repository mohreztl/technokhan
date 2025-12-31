'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rotationIntensity?: number;
  shadowIntensity?: number;
}

/**
 * 3D Tilt Card - کارت با افکت چرخش ۳D
 */
export function Card3D({
  children,
  className,
  containerClassName,
  rotationIntensity = 10,
  shadowIntensity = 0.3,
}: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${rotationIntensity}deg`, `-${rotationIntensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${rotationIntensity}deg`, `${rotationIntensity}deg`]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className={cn('perspective-1000', containerClassName)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative transition-shadow duration-500',
          className
        )}
      >
        {/* Shadow layer */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-black/20 blur-xl -z-10"
          style={{
            rotateX,
            rotateY,
            translateZ: '-50px',
            opacity: shadowIntensity,
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Floating Card - کارت شناور
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
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
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
}: {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setPosition({
      x: (e.clientX - centerX) * magneticStrength,
      y: (e.clientY - centerY) * magneticStrength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 15,
      }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Parallax Section - سکشن با افکت پارالکس
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
  const [scrollY, setScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollY(scrollProgress * 100 * speed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={{
          y: scrollY,
        }}
      >
        {children}
      </motion.div>
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
    up: { y: 100, opacity: 0 },
    down: { y: -100, opacity: 0 },
    left: { x: 100, opacity: 0 },
    right: { x: -100, opacity: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={directionVariants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
