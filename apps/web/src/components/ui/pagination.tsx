'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** When given, page buttons render as crawlable links (`?page=`) and still call `onPageChange`. */
  hrefFor?: (page: number) => string;
  siblingCount?: number;
  className?: string;
}

type PageToken = number | 'dots';

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => i + start);
}

export function usePaginationRange(currentPage: number, totalPages: number, siblingCount = 1): PageToken[] {
  return React.useMemo<PageToken[]>(() => {
    const totalPageNumbers = siblingCount + 5;
    if (totalPageNumbers >= totalPages) return range(1, totalPages);

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 2;

    if (!showLeftDots && showRightDots) {
      return [...range(1, 3 + 2 * siblingCount), 'dots', totalPages];
    }
    if (showLeftDots && !showRightDots) {
      const count = 3 + 2 * siblingCount;
      return [1, 'dots', ...range(totalPages - count + 1, totalPages)];
    }
    return [1, 'dots', ...range(leftSibling, rightSibling), 'dots', totalPages];
  }, [currentPage, totalPages, siblingCount]);
}

/** Page navigation with 44px targets, Persian digits and optional real links. */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hrefFor,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const tokens = usePaginationRange(currentPage, totalPages, siblingCount);

  if (totalPages <= 1) return null;

  const go = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const PageButton = ({
    page,
    label,
    disabled,
    active,
    children,
    className: cls,
  }: {
    page: number;
    label: string;
    disabled?: boolean;
    active?: boolean;
    children: React.ReactNode;
    className?: string;
  }) => {
    const variant = active ? 'primary' : 'outline';
    if (hrefFor && !disabled) {
      return (
        <Button asChild variant={variant} size="icon" className={cn('min-h-11 min-w-11', cls)}>
          <Link
            href={hrefFor(page)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            scroll={false}
            onClick={(e) => {
              e.preventDefault();
              go(page);
            }}
          >
            {children}
          </Link>
        </Button>
      );
    }
    return (
      <Button
        type="button"
        variant={variant}
        size="icon"
        className={cn('min-h-11 min-w-11', cls)}
        onClick={() => go(page)}
        disabled={disabled}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
      >
        {children}
      </Button>
    );
  };

  return (
    <nav aria-label="صفحه‌بندی" className={cn('flex items-center justify-center gap-1.5 sm:gap-2', className)}>
      <PageButton page={1} label="صفحهٔ اول" disabled={currentPage === 1} className="hidden sm:inline-flex">
        <ChevronsRight className="h-4 w-4" />
      </PageButton>
      <PageButton page={currentPage - 1} label="صفحهٔ قبل" disabled={currentPage === 1}>
        <ChevronRight className="h-4 w-4" />
      </PageButton>

      <ol className="flex items-center gap-1" dir="rtl">
        {tokens.map((token, index) =>
          token === 'dots' ? (
            <li key={`dots-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={token}>
              <PageButton
                page={token}
                label={`صفحهٔ ${toPersianDigits(token)}`}
                active={token === currentPage}
                className="tabular-nums"
              >
                {toPersianDigits(token)}
              </PageButton>
            </li>
          )
        )}
      </ol>

      <PageButton page={currentPage + 1} label="صفحهٔ بعد" disabled={currentPage === totalPages}>
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
      <PageButton
        page={totalPages}
        label="صفحهٔ آخر"
        disabled={currentPage === totalPages}
        className="hidden sm:inline-flex"
      >
        <ChevronsLeft className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}
