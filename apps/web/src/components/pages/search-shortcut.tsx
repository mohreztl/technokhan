'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface SearchShortcutProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  label?: string;
}

/** Opens the global search modal (used on pages without their own search box). */
export function SearchShortcut({ label = 'جستجو در سایت', variant = 'outline', className, ...props }: SearchShortcutProps) {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  return (
    <Button type="button" variant={variant} onClick={() => setSearchOpen(true)} className={className} {...props}>
      <Search className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
