'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Inbox, MailOpen } from 'lucide-react';
import type { ContactMessage } from '@technokhan/shared';
import { toPersianDigits } from '@technokhan/shared';
import { useAdminMessages, useAdminMutations } from '@/lib/hooks/use-admin';
import { formatJalaliDateTime } from '@/lib/jalali';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminPagination, EmptyState } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { FiltersBar } from '@/components/admin/filters-bar';
import { MessageDetailSheet } from '@/components/admin/message-detail-sheet';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

const FILTER_CHIPS = [
  { value: 'all', label: 'همه' },
  { value: 'unread', label: 'خوانده‌نشده' },
];

const snippet = (text: string, max = 90) => (text.length > max ? `${text.slice(0, max).trim()}…` : text);

export function AdminMessagesClient() {
  const params = useSearchParams();
  const [filter, setFilter] = React.useState(params.get('filter') === 'unread' ? 'unread' : 'all');
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<ContactMessage | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const { markMessageRead } = useAdminMutations();

  const query = React.useMemo(
    () => ({ unread: filter === 'unread' ? true : undefined, page, limit: PAGE_SIZE }),
    [filter, page]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminMessages(query);

  // unread first; the transport already sorts by date
  const items = React.useMemo(() => [...(data?.items ?? [])].sort((a, b) => Number(a.isRead) - Number(b.isRead)), [data?.items]);
  const unreadCount = items.filter((m) => !m.isRead).length;

  const openMessage = (m: ContactMessage) => {
    setSelected(m);
    setSheetOpen(true);
  };

  const markRead = (id: string) => {
    markMessageRead.mutate(id, {
      onSuccess: (updated) => {
        toast.success('پیام به‌عنوان خوانده‌شده علامت خورد');
        setSelected((s) => (s && s.id === id ? { ...s, ...updated, isRead: true } : s));
      },
      onError: (e) => toast.error('ثبت ناموفق بود', { description: e.message }),
    });
  };

  return (
    <>
      <AdminPageHeader
        title="پیام‌ها"
        subtitle={
          data?.pagination
            ? `${toPersianDigits(data.pagination.total)} پیام${unreadCount ? ` · ${toPersianDigits(unreadCount)} خوانده‌نشده در این صفحه` : ''}`
            : 'پیام‌های فرم تماس'
        }
      />

      <FiltersBar
        className="mb-4"
        chips={FILTER_CHIPS}
        chipsLabel="فیلتر پیام‌ها"
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <div className={cn(isFetching && !isLoading && 'opacity-70 transition-opacity')} aria-busy={isLoading || isFetching || undefined}>
        {isLoading ? (
          <ul className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background py-12">
            <EmptyState
              icon={<Inbox />}
              title={filter === 'unread' ? 'پیام خوانده‌نشده‌ای ندارید' : 'پیامی دریافت نشده'}
              description={filter === 'unread' ? 'همهٔ پیام‌ها را بررسی کرده‌اید.' : 'پیام‌های ارسالی از فرم تماس اینجا نمایش داده می‌شوند.'}
            />
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xs">
            {items.map((m) => (
              <li key={m.id} className="border-b border-border/50 last:border-b-0">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openMessage(m)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openMessage(m);
                    }
                  }}
                  aria-label={`${m.isRead ? '' : 'خوانده‌نشده، '}${m.name}: ${m.subject}`}
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-start transition-colors',
                    'hover:bg-secondary/10 focus-visible:bg-secondary/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    !m.isRead && 'bg-secondary/5'
                  )}
                >
                  <span className="relative mt-0.5 shrink-0">
                    <Avatar size="md" fallback={m.name.charAt(0)} className={cn(!m.isRead && 'ring-2 ring-secondary/60')} />
                    {!m.isRead && (
                      <span className="absolute -inset-e-0.5 -top-0.5 h-3 w-3 rounded-full bg-secondary ring-2 ring-background" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-sm', m.isRead ? 'font-semibold text-foreground' : 'font-black text-foreground')}>{m.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatJalaliDateTime(m.createdAt)}</span>
                    </span>
                    <span className={cn('mt-0.5 block truncate text-sm', m.isRead ? 'text-foreground' : 'font-bold text-foreground')}>{m.subject}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground line-clamp-2">{snippet(m.message)}</span>
                  </span>
                  {!m.isRead && (
                    <IconButton
                      label={`علامت‌گذاری «${m.subject}» به‌عنوان خوانده‌شده`}
                      icon={<MailOpen />}
                      size="sm"
                      className="-me-2 shrink-0 self-center"
                      disabled={markMessageRead.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(m.id);
                      }}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data?.pagination && !isLoading && items.length > 0 && (
        <AdminPagination pagination={data.pagination} onPageChange={setPage} className="mt-4" />
      )}

      <MessageDetailSheet
        message={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onMarkRead={markRead}
        marking={markMessageRead.isPending}
      />
    </>
  );
}
