'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from 'lucide-react';
import type { Pagination } from '@technokhan/shared';
import { toPersianDigits } from '@technokhan/shared';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Applied to both the header and body cells. */
  className?: string;
  headerClassName?: string;
  /** Skip in the generic stacked layout below `md` (ignored when `mobile` is given). */
  hideOnMobile?: boolean;
}

export interface DataTableEmptyState {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Card body for phones; falls back to a stacked label/value list. */
  mobile?: (row: T) => React.ReactNode;
  /** Whole row / card navigates here. */
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** First load: skeleton rows. */
  loading?: boolean;
  /** Background refetch: rows dim slightly. */
  fetching?: boolean;
  skeletonRows?: number;
  empty?: DataTableEmptyState;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  /** Accessible table name. */
  caption?: string;
  className?: string;
}

/**
 * Generic admin list: a sticky-header `<table>` from `md` up, stacked cards
 * below. Handles loading, empty state and a Persian-digit pagination footer.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  mobile,
  rowHref,
  onRowClick,
  loading = false,
  fetching = false,
  skeletonRows = 5,
  empty,
  pagination,
  onPageChange,
  caption,
  className,
}: DataTableProps<T>) {
  const router = useRouter();
  const interactive = Boolean(rowHref || onRowClick);

  const activate = (row: T) => {
    if (onRowClick) onRowClick(row);
    else if (rowHref) router.push(rowHref(row));
  };

  const onRowKeyDown = (e: React.KeyboardEvent, row: T) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate(row);
    }
  };

  const mobileColumns = columns.filter((c) => !c.hideOnMobile);
  const showEmpty = !loading && rows.length === 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* ---- md+: table ---- */}
      <div
        className={cn(
          'hidden overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xs md:block',
          fetching && 'opacity-70 transition-opacity'
        )}
        aria-busy={loading || fetching || undefined}
      >
        <div className="max-h-[70dvh] overflow-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead className="sticky top-0 z-10 bg-background-secondary/95 text-xs text-muted-foreground backdrop-blur-sm">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn('whitespace-nowrap px-4 py-3 text-start font-semibold', c.className, c.headerClassName)}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading &&
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-4 py-3', c.className)}>
                        <Skeleton className="h-4 w-full max-w-36" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    tabIndex={interactive ? 0 : undefined}
                    onClick={interactive ? () => activate(row) : undefined}
                    onKeyDown={interactive ? (e) => onRowKeyDown(e, row) : undefined}
                    className={cn(
                      'transition-colors',
                      interactive &&
                        'cursor-pointer hover:bg-secondary/10 focus-visible:bg-secondary/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
                    )}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              {showEmpty && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12">
                    <EmptyState {...empty} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- below md: cards ---- */}
      <div className={cn('md:hidden', fetching && 'opacity-70 transition-opacity')} aria-busy={loading || fetching || undefined}>
        {loading && (
          <ul className="space-y-3">
            {Array.from({ length: Math.min(skeletonRows, 4) }).map((_, i) => (
              <li key={`msk-${i}`} className="rounded-2xl border border-border/60 bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-3.5 w-3/4" />
                <Skeleton className="mt-2 h-3.5 w-1/2" />
              </li>
            ))}
          </ul>
        )}
        {!loading && rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((row) => {
              const body = mobile ? (
                mobile(row)
              ) : (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                  {mobileColumns.map((c) => (
                    <React.Fragment key={c.key}>
                      <dt className="text-xs font-semibold text-muted-foreground">{c.header}</dt>
                      <dd className="min-w-0 text-foreground">{c.cell(row)}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              );
              const cardClass = cn(
                'block w-full rounded-2xl border border-border/60 bg-background p-4 text-start shadow-xs transition-all',
                interactive && 'active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
              );
              return (
                <li key={rowKey(row)}>
                  {rowHref && !onRowClick ? (
                    <Link href={rowHref(row)} className={cardClass}>
                      {body}
                    </Link>
                  ) : onRowClick ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => activate(row)}
                      onKeyDown={(e) => onRowKeyDown(e, row)}
                      className={cn(cardClass, 'cursor-pointer')}
                    >
                      {body}
                    </div>
                  ) : (
                    <div className={cardClass}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {showEmpty && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background px-4 py-10">
            <EmptyState {...empty} />
          </div>
        )}
      </div>

      {pagination && onPageChange && !loading && rows.length > 0 && (
        <AdminPagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title = 'موردی یافت نشد',
  description,
  action,
}: Partial<DataTableEmptyState>) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:h-6 [&_svg]:w-6" aria-hidden="true">
        {icon ?? <Inbox />}
      </span>
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description && <p className="max-w-xs text-xs leading-5 text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Page numbers around `page` (max five) plus first / last. */
function pageWindow(page: number, totalPages: number): (number | 'dots')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - 1, totalPages - 3));
  const end = Math.min(totalPages - 1, start + 2);
  const out: (number | 'dots')[] = [1];
  if (start > 2) out.push('dots');
  for (let p = start; p <= end; p++) out.push(p);
  if (end < totalPages - 1) out.push('dots');
  out.push(totalPages);
  return out;
}

export interface AdminPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  className?: string;
}

/** 44px pagination controls with Persian digits and a «نمایش … از …» summary. */
export function AdminPagination({ pagination, onPageChange, className }: AdminPaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={cn('flex flex-col items-center gap-3 sm:flex-row sm:justify-between', className)}>
      <p className="text-xs text-muted-foreground">
        نمایش {toPersianDigits(from)} تا {toPersianDigits(to)} از {toPersianDigits(total)} مورد
      </p>
      {totalPages > 1 && (
        <nav aria-label="صفحه‌بندی" className="flex items-center gap-1">
          <IconButton
            label="صفحه اول"
            icon={<ChevronsRight />}
            variant="outline"
            size="sm"
            className="rounded-xl border-border"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          />
          <IconButton
            label="صفحه قبل"
            icon={<ChevronRight />}
            variant="outline"
            size="sm"
            className="rounded-xl border-border"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          />
          <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
            {pageWindow(page, totalPages).map((p, i) =>
              p === 'dots' ? (
                <span key={`dots-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-label={`صفحه ${toPersianDigits(p)}`}
                  aria-current={p === page ? 'page' : undefined}
                  className={cn(
                    'h-11 min-w-[44px] rounded-xl px-2 text-sm font-semibold tabular-nums transition-colors lg:h-10 lg:min-w-[40px]',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                    p === page ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary/15'
                  )}
                >
                  {toPersianDigits(p)}
                </button>
              )
            )}
          </div>
          <IconButton
            label="صفحه بعد"
            icon={<ChevronLeft />}
            variant="outline"
            size="sm"
            className="rounded-xl border-border"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          />
          <IconButton
            label="صفحه آخر"
            icon={<ChevronsLeft />}
            variant="outline"
            size="sm"
            className="rounded-xl border-border"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          />
        </nav>
      )}
    </div>
  );
}
