import { useEffect, useState } from 'react';

/**
 * Hook to detect user's motion preference for accessibility
 * Returns true if user prefers reduced motion
 *
 * @returns {boolean} - True if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation variants based on motion preference
 * Returns null for all animation states if user prefers reduced motion
 */
export function useAccessibleAnimation<T extends Record<string, any>>(variants: T): T | null {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return variants;
}

/**
 * Hook to conditionally apply animation props
 * Returns empty object if user prefers reduced motion
 */
export function useMotionProps<T extends Record<string, any>>(props: T): T | Record<string, never> {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {};
  }

  return props;
}
