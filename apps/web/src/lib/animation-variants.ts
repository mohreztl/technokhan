/**
 * Centralized Animation Variants Library
 *
 * Reusable Framer Motion animation variants for consistent motion design
 * across the entire application. Follows AutoLounge's luxury brand aesthetic.
 */

import { Variants, Transition } from 'framer-motion';

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const transitions = {
  spring: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20,
  },
  springBouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  springSmooth: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 30,
  },
  ease: {
    duration: 0.6,
    ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier
  },
  easeInOut: {
    duration: 0.8,
    ease: [0.43, 0.13, 0.23, 0.96],
  },
  smooth: {
    duration: 0.4,
    ease: 'easeOut' as const,
  },
};

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.ease,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.easeInOut,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.easeInOut,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.easeInOut,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.easeInOut,
  },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
};

export const scaleInSubtle: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springSmooth,
  },
};

// =============================================================================
// STAGGER CONTAINERS
// =============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

// =============================================================================
// HERO SECTION SPECIFIC
// =============================================================================

export const heroBadge: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const heroHeading: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.1,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const heroDescription: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const heroFeatures: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const heroCTA: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const heroStats: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const heroScrollIndicator: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1.2,
      duration: 0.6,
    },
  },
};

// =============================================================================
// DECORATIVE ELEMENTS (Orbs, Particles)
// =============================================================================

export const floatingOrb = (duration = 8): Transition => ({
  scale: [1, 1.2, 1],
  opacity: [0.2, 0.4, 0.2],
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
});

export const floatingOrbReverse = (duration = 10): Transition => ({
  scale: [1.2, 1, 1.2],
  opacity: [0.3, 0.2, 0.3],
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
});

// =============================================================================
// INTERACTIVE HOVER EFFECTS
// =============================================================================

export const hoverScale = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: transitions.spring,
  },
};

export const hoverScaleSubtle = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: transitions.smooth,
  },
};

export const hoverLift = {
  rest: { y: 0 },
  hover: {
    y: -8,
    transition: transitions.spring,
  },
};

export const hoverGlow = {
  rest: { boxShadow: '0 0 0 rgba(194, 178, 128, 0)' },
  hover: {
    boxShadow: '0 0 20px rgba(194, 178, 128, 0.5)',
    transition: transitions.smooth,
  },
};

// =============================================================================
// CARD ANIMATIONS
// =============================================================================

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: transitions.spring,
  },
};

export const cardEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.springSmooth,
  },
};

// =============================================================================
// CAROUSEL / SLIDER ANIMATIONS
// =============================================================================

export const carouselSlide: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export const carouselTransition: Transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

// =============================================================================
// VIEWPORT CONFIGURATIONS
// =============================================================================

export const viewportConfig = {
  once: { once: true },
  repeat: { once: false, amount: 0.3 },
  withMargin: { once: true, margin: '-100px' },
  immediate: { once: true, amount: 0 },
};

// =============================================================================
// GESTURE ANIMATIONS (Tap, Drag)
// =============================================================================

export const tapScale = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

export const tapScaleSubtle = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// =============================================================================
// BACKGROUND GRADIENT ANIMATIONS
// =============================================================================

export const gradientShift: Variants = {
  initial: {
    backgroundPosition: '0% 50%',
  },
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create custom delay for staggered animations
 */
export const createStaggerDelay = (index: number, baseDelay = 0.1) => ({
  delay: index * baseDelay,
});

/**
 * Combine multiple variants
 */
export const mergeVariants = (...variants: Partial<Variants>[]): Variants => {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {}) as Variants;
};
