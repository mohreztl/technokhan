'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover = true, animate = true, onClick }, ref) => {
    const Component = animate ? motion.div : 'div';
    const animationProps = animate
      ? {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.5 },
        }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          'glass-effect rounded-xl p-6',
          hover && 'card-hover cursor-pointer',
          className
        )}
        onClick={onClick}
        {...animationProps}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('mb-4', className)}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...props }, ref) => {
  return (
    <h3 ref={ref} className={cn('text-xl font-bold text-foreground', className)} {...props}>
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className, ...props }, ref) => {
  return (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('', className)}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('mt-4 flex items-center gap-2', className)}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
