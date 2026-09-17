'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BadgeCheck, ExternalLink, Package, Star, Trash2, Wrench } from 'lucide-react';
import { findProduct, findService, toPersianDigits } from '@autolounge/shared';
import type { AdminReview } from '@/lib/api/endpoints';
import { useAdminMutations, useAdminReviews } from '@/lib/hooks/use-admin';
import { formatJalaliDateTime } from '@/lib/jalali';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { AdminPagination, EmptyState } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { RatingStars } from '@/components/admin/rating-stars';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type Tab = 'pending' | 'approved';

interface Target {
  kind: 'product' | 'service';
  id: string;
  name: string;
  href: string;
}

function reviewTarget(r: AdminReview): Target | null {
  const kind = r.targetType ?? (r.productId ? 'product' : r.serviceId ? 'service' : null);
  const id = r.targetId ?? r.productId ?? r.serviceId;
  if (!kind || !id) return null;
  const name = kind === 'product' ? findProduct(id)?.name : findService(id)?.name;
  return { kind, id, name: name ?? id, href: `/${kind === 'product' ? 'products' : 'services'}/${id}` };
}

export function AdminReviewsClient() {
  const [tab, setTab] = React.useState<Tab>('pending');
  const [page, setPage] = React.useState(1);
  const [deleting, setDeleting] = React.useState<AdminReview | null>(null);
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  const { approveReview, deleteReview } = useAdminMutations();

  const query = React.useMemo(() => ({ approved: tab === 'approved', page, limit: PAGE_SIZE }), [tab, page]);
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminReviews(query);
  const items = data?.items ?? [];

  const approve = (r: AdminReview) => {
    setApprovingId(r.id);
    approveReview.mutate(r.id, {
      onSuccess: () => toast.success('نظر تأیید و منتشر شد', { description: r.userName }),
      onError: (e) => toast.error('تأیید نظر ناموفق بود', { description: e.message }),
      onSettled: () => setApprovingId(null),
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    deleteReview.mutate(target.id, {
      onSuccess: () => {
        toast.success('نظر حذف شد', { description: target.userName });
        setDeleting(null);
      },
      onError: (e) => toast.error('حذف نظر ناموفق بود', { description: e.message }),
    });
  };

  return (
    <>
      <AdminPageHeader
        title="نظرات"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} نظر ${tab === 'pending' ? 'در انتظار تأیید' : 'تأیید شده'}` : 'بررسی نظرات کاربران'}
      />

      <Tabs
        defaultValue="pending"
        value={tab}
        onValueChange={(v) => {
          setTab(v as Tab);
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="h-10 flex-1 sm:flex-none">
            در انتظار تأیید
          </TabsTrigger>
          <TabsTrigger value="approved" className="h-10 flex-1 sm:flex-none">
            تأیید شده
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <div className={cn(isFetching && !isLoading && 'opacity-70 transition-opacity')} aria-busy={isLoading || isFetching || undefined}>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background py-12">
            <EmptyState
              icon={<Star />}
              title={tab === 'pending' ? 'نظری در انتظار تأیید نیست' : 'هنوز نظری تأیید نشده'}
              description={tab === 'pending' ? 'نظرات جدید کاربران اینجا نمایش داده می‌شوند.' : 'نظرات تأییدشده در صفحهٔ محصول یا خدمت نمایش داده می‌شوند.'}
            />
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((r) => {
              const target = reviewTarget(r);
              const isApproving = approvingId === r.id && approveReview.isPending;
              return (
                <li key={r.id} className="flex flex-col rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Avatar size="md" fallback={r.userName.charAt(0)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-foreground">{r.userName}</span>
                        <RatingStars value={r.rating} size="sm" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{formatJalaliDateTime(r.createdAt)}</p>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-6 text-foreground">{r.comment}</p>

                  {target && (
                    <Link
                      href={target.href}
                      className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-lg text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {target.kind === 'product' ? <Package className="h-3.5 w-3.5" aria-hidden="true" /> : <Wrench className="h-3.5 w-3.5" aria-hidden="true" />}
                      <span className="truncate">{target.name}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    {tab === 'pending' ? (
                      <Button type="button" size="sm" className="gap-2" loading={isApproving} loadingText="در حال تأیید…" onClick={() => approve(r)}>
                        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                        تأیید و انتشار
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                        منتشر شده
                      </span>
                    )}
                    <IconButton
                      label={`حذف نظر ${r.userName}`}
                      icon={<Trash2 />}
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleting(r)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {data?.pagination && !isLoading && items.length > 0 && (
        <AdminPagination pagination={data.pagination} onPageChange={setPage} className="mt-4" />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title="حذف این نظر؟"
        description={deleting ? `نظر «${deleting.userName}» برای همیشه حذف می‌شود.` : undefined}
        confirmLabel="بله، حذف کن"
        destructive
        loading={deleteReview.isPending}
        icon={<Trash2 />}
        onConfirm={confirmDelete}
      />
    </>
  );
}
