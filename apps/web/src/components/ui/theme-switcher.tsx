'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
  /** Larger pill with label, used inside sheets/menus */
  variant?: 'icon' | 'pill';
}

/** Adds a short, scoped color transition to the whole document while the theme flips. */
function withThemeTransition(fn: () => void) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  fn();
  window.setTimeout(() => root.classList.remove('theme-transition'), 350);
}

export function ThemeSwitcher({ className, variant = 'icon' }: ThemeSwitcherProps) {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-full bg-muted',
          variant === 'icon' ? 'h-11 w-11' : 'h-11 w-32',
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';
  const toggle = () => withThemeTransition(() => setTheme(isDark ? 'light' : 'dark'));
  const label = isDark ? 'تغییر به حالت روز' : 'تغییر به حالت شب';

  const icons = (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <motion.span
        initial={false}
        animate={{ scale: isDark ? 0 : 1, rotate: isDark ? 90 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-secondary" />
      </motion.span>
      <motion.span
        initial={false}
        animate={{ scale: isDark ? 1 : 0, rotate: isDark ? 0 : -90, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-primary" />
      </motion.span>
    </span>
  );

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex h-11 items-center gap-3 rounded-full px-4 glass-effect text-sm font-medium text-foreground',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        aria-label={label}
      >
        {icons}
        <span>{isDark ? 'حالت روز' : 'حالت شب'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300',
        'glass-effect hover:scale-110 hover:shadow-glow-primary',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={label}
    >
      {icons}
    </button>
  );
}
