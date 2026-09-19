'use client';

import * as React from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ArticleTocProps {
  headings: { id: string; text: string }[];
  className?: string;
}

/**
 * Table of contents that highlights the section in view. Plain anchors, so it
 * works before hydration and with JavaScript off — the highlight is the only
 * part that needs the observer.
 */
export function ArticleToc({ headings, className }: ArticleTocProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost heading currently inside the band is the active one.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="فهرست مطالب" className={cn('rounded-2xl border border-border bg-card p-4', className)}>
      <p className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
        <List className="h-4 w-4 text-secondary" aria-hidden="true" />
        فهرست مطالب
      </p>
      <ol className="space-y-1">
        {headings.map((h) => {
          const active = activeId === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex min-h-10 items-center rounded-lg border-s-2 px-3 text-sm leading-6 transition-colors',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'border-secondary bg-secondary/10 font-bold text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
