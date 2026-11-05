'use client';

import * as React from 'react';
import { GitCompareArrows } from 'lucide-react';
import type { Service } from '@technokhan/shared';
import { useCompare, useCompareStore } from '@/lib/store/compare-store';
import { useHydrated } from '@/lib/store/hydration';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { showToast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export interface CompareToggleProps {
  service: Pick<Service, 'id' | 'name'>;
  /** `icon` for card corners, `button` for the detail page's action row. */
  variant?: 'icon' | 'button';
  className?: string;
}

/**
 * Adds/removes a service from the comparison list. Renders inert until the
 * persisted store has read localStorage so the server and first paint agree.
 */
export function CompareToggle({ service, variant = 'icon', className }: CompareToggleProps) {
  const hydrated = useHydrated(useCompareStore);
  const { has, toggle } = useCompare();
  const picked = hydrated && has(service.id);

  const label = picked ? 'حذف از مقایسه' : 'افزودن به مقایسه';

  const onClick = (e: React.MouseEvent) => {
    // Cards wrap these in a link; comparing is not navigating.
    e.preventDefault();
    e.stopPropagation();
    const wasPicked = has(service.id);
    const added = toggle(service.id);
    if (!wasPicked && !added) {
      showToast.error('حداکثر ۴ خدمت', 'برای مقایسهٔ خدمت دیگری، یکی از انتخاب‌ها را بردارید.');
      return;
    }
    showToast.success(added ? 'به مقایسه اضافه شد' : 'از مقایسه حذف شد', service.name);
  };

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant={picked ? 'secondary' : 'outline'}
        aria-pressed={picked}
        onClick={onClick}
        className={cn('gap-2', className)}
      >
        <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
    );
  }

  return (
    <IconButton
      label={`${label}: ${service.name}`}
      icon={<GitCompareArrows />}
      variant="glass"
      size="sm"
      active={picked}
      aria-pressed={picked}
      onClick={onClick}
      className={cn(
        'bg-background/70 text-foreground shadow-md',
        picked && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        className
      )}
    />
  );
}
