'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  /** Called with the trimmed value after `delay` ms of inactivity (and immediately on clear). */
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  label?: string;
  className?: string;
  autoFocus?: boolean;
}

/** Debounced 44px search field with a clear button. Controlled from the outside, buffered inside. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'جست‌وجو…',
  delay = 300,
  label = 'جست‌وجو',
  className,
  autoFocus,
}: SearchInputProps) {
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const latest = React.useRef(onChange);
  latest.current = onChange;

  // keep the buffer in sync when the parent resets the value
  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  React.useEffect(() => {
    if (draft === value) return;
    const t = window.setTimeout(() => latest.current(draft.trim()), delay);
    return () => window.clearTimeout(t);
  }, [draft, value, delay]);

  const clear = () => {
    setDraft('');
    latest.current('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Search
        className="pointer-events-none absolute inset-s-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && draft) {
            e.preventDefault();
            clear();
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className={cn(
          'h-11 w-full rounded-xl border border-input bg-background pe-11 ps-10 text-sm text-foreground placeholder:text-muted-foreground',
          'transition-all focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-ring',
          '[&::-webkit-search-cancel-button]:hidden'
        )}
      />
      {draft && (
        <IconButton
          label="پاک کردن جست‌وجو"
          icon={<X />}
          size="sm"
          variant="ghost"
          className="absolute inset-e-0.5 top-1/2 -translate-y-1/2"
          onClick={clear}
        />
      )}
    </div>
  );
}
