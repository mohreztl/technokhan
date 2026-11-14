'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { useSettings } from '@/lib/hooks/use-settings';
import { cn } from '@/lib/utils';
import { getSupportContactLinks } from './support-contact';

export function SupportContactLinks({ compact = false }: { compact?: boolean }) {
  const links = getSupportContactLinks(useSettings());
  return (
    <nav aria-label="راه‌های ارتباط مستقیم" className={cn('grid gap-2', compact ? 'grid-cols-3' : 'sm:grid-cols-3')}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target={link.id === 'phone' ? undefined : '_blank'}
          rel={link.id === 'phone' ? undefined : 'noreferrer'}
          className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-center text-xs font-semibold transition-colors hover:border-secondary hover:text-foreground', !compact && 'sm:min-h-14 sm:text-sm')}
        >
          {link.id === 'phone' ? <Phone className="size-4 shrink-0 text-secondary" aria-hidden="true" /> : <MessageCircle className="size-4 shrink-0 text-secondary" aria-hidden="true" />}
          {link.label}
        </a>
      ))}
    </nav>
  );
}
