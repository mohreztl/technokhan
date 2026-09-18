'use client';

import * as React from 'react';
import { toPersianDigits } from '@autolounge/shared';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
  /** Accessible name (required — icon-only controls have no visible text). */
  label: string;
  icon: React.ReactNode;
  /** `sm` shrinks to 40px on desktop only; every size is at least 44px on touch layouts. */
  size?: IconButtonSize;
  /** Small gold counter (rendered with Persian digits, hidden when 0). */
  badge?: number;
  /** Highlighted/pressed state (e.g. active wishlist heart). */
  active?: boolean;
  /** Render the child element (e.g. `<Link>`) instead of a `<button>`; the icon is injected into it. */
  asChild?: boolean;
  children?: React.ReactNode;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'h-11 w-11 lg:h-10 lg:w-10 [&_svg]:h-[18px] [&_svg]:w-[18px]',
  md: 'h-11 w-11 [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-12 w-12 [&_svg]:h-6 [&_svg]:w-6',
};

const formatBadge = (n: number) => toPersianDigits(n > 99 ? '99+' : n);

/**
 * 44px-minimum icon-only button built on `Button`. Always has an `aria-label`,
 * optional gold badge, and `asChild` support for links:
 *
 * ```tsx
 * <IconButton asChild label="پروفایل" icon={<User />}><Link href="/profile" /></IconButton>
 * ```
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      icon,
      size = 'md',
      variant = 'ghost',
      badge,
      active,
      asChild,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const showBadge = typeof badge === 'number' && badge > 0;
    const accessibleName = showBadge ? `${label} (${toPersianDigits(badge)})` : label;

    const content = (
      <>
        <span className="flex items-center justify-center" aria-hidden="true">
          {icon}
        </span>
        {showBadge && (
          <span
            className={cn(
              'absolute -top-0.5 -inset-e-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1',
              'bg-secondary text-secondary-foreground text-[11px] font-bold leading-none tabular-nums',
              'shadow-[0_2px_10px_hsl(var(--secondary)/0.5)] ring-2 ring-background'
            )}
            aria-hidden="true"
          >
            {formatBadge(badge)}
          </span>
        )}
      </>
    );

    const classes = cn(
      'relative shrink-0 rounded-full',
      sizeClasses[size],
      active && 'bg-primary/10 text-primary',
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return (
        <Button
          ref={ref}
          asChild
          variant={variant}
          size="icon"
          className={classes}
          aria-label={accessibleName}
          title={label}
          {...props}
        >
          {React.cloneElement(child, undefined, content)}
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        size="icon"
        className={classes}
        aria-label={accessibleName}
        aria-pressed={active}
        title={label}
        {...props}
      >
        {content}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
