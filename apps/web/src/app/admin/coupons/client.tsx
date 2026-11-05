'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Copy, Infinity as InfinityIcon, Pencil, Plus, Power, Tag, Trash2 } from 'lucide-react';
import { formatToman, toPersianDigits } from '@technokhan/shared';
import type { Coupon } from '@technokhan/shared';
import { useAdminCoupons, useAdminMutations } from '@/lib/hooks/use-admin';
import { formatJalali } from '@/lib/jalali';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { CouponFormDialog } from '@/components/admin/coupon-form-dialog';
import { EmptyState } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { cn } from '@/lib/utils';

/** A coupon is spent when it has a limit and has reached it. */
function isUsedUp(c: Coupon): boolean {
  return c.usageLimit != null && (c.usedCount ?? 0) >= c.usageLimit;
}

function isExpired(c: Coupon): boolean {
  return Boolean(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now());
}

function statusOf(c: Coupon): { label: string; variant: 'success' | 'warning' | 'destructive' | 'muted' } {
  if (c.isActive === false) return { label: 'غیرفعال', variant: 'muted' };
  if (isExpired(c)) return { label: 'منقضی', variant: 'destructive' };
  if (isUsedUp(c)) return { label: 'ظرفیت تکمیل', variant: 'warning' };
  return { label: 'فعال', variant: 'success' };
}

function amountOf(c: Coupon): string {
  return c.type === 'percent' ? `${toPersianDigits(c.value)}٪` : formatToman(c.value);
}

export function AdminCouponsClient() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminCoupons();
  const { updateCoupon, deleteCoupon } = useAdminMutations();
  const [editing, setEditing] = React.useState<Coupon | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Coupon | null>(null);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const coupons = data ?? [];
  const activeCount = coupons.filter((c) => statusOf(c).label === 'فعال').length;

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setFormOpen(true);
  };

  const toggleActive = (c: Coupon) => {
    if (!c.id) return;
    setTogglingId(c.id);
    updateCoupon.mutate(
      { id: c.id, patch: { isActive: !(c.isActive ?? true) } },
      {
        onSuccess: (saved) =>
          toast.success(saved.isActive ? 'کد فعال شد' : 'کد غیرفعال شد', { description: saved.code }),
        onError: (e) => toast.error('تغییر وضعیت ناموفق بود', { description: e.message }),
        onSettled: () => setTogglingId(null),
      }
    );
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('کد کپی شد', { description: code });
    } catch {
      toast.error('امکان کپی وجود ندارد');
    }
  };

  const confirmDelete = () => {
    const target = deleting;
    if (!target?.id) return;
    deleteCoupon.mutate(target.id, {
      onSuccess: () => {
        toast.success('کد تخفیف حذف شد', { description: target.code });
        setDeleting(null);
      },
      onError: (e) => toast.error('حذف کد ناموفق بود', { description: e.message }),
    });
  };

  return (
    <>
      <AdminPageHeader
        title="کدهای تخفیف"
        subtitle={
          coupons.length
            ? `${toPersianDigits(coupons.length)} کد · ${toPersianDigits(activeCount)} فعال`
            : 'کدهای تخفیف فروشگاه را اینجا بسازید و مدیریت کنید'
        }
        actions={
          <Button type="button" size="sm" className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            کد جدید
          </Button>
        }
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <div className={cn(isFetching && !isLoading && 'opacity-70 transition-opacity')} aria-busy={isLoading || undefined}>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background py-12">
            <EmptyState
              icon={<Tag />}
              title="هنوز کد تخفیفی نساخته‌اید"
              description="با ساخت اولین کد، مشتریان می‌توانند آن را هنگام پرداخت وارد کنند."
              action={
                <Button type="button" size="sm" className="gap-2" onClick={openNew}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  ساخت کد تخفیف
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {coupons.map((c) => {
              const status = statusOf(c);
              const busy = togglingId === c.id && updateCoupon.isPending;
              return (
                <li
                  key={c.id ?? c.code}
                  className="flex flex-col rounded-2xl border border-border/60 bg-background p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-mono text-base font-black tracking-widest text-foreground" dir="ltr">
                          {c.code}
                        </span>
                        <IconButton label={`کپی کد ${c.code}`} icon={<Copy />} size="sm" onClick={() => copyCode(c.code)} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{c.description}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">مقدار تخفیف</dt>
                      <dd className="mt-0.5 font-bold text-foreground tabular-nums">{amountOf(c)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">سقف تخفیف</dt>
                      <dd className="mt-0.5 font-bold text-foreground tabular-nums">
                        {c.maxDiscount ? formatToman(c.maxDiscount) : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">حداقل سفارش</dt>
                      <dd className="mt-0.5 font-bold text-foreground tabular-nums">
                        {c.minTotal ? formatToman(c.minTotal) : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">انقضا</dt>
                      <dd className="mt-0.5 font-bold text-foreground tabular-nums">
                        {c.expiresAt ? formatJalali(new Date(c.expiresAt)) : 'بدون انقضا'}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">استفاده‌شده</dt>
                      <dd className="mt-0.5 flex items-center gap-1 font-bold text-foreground tabular-nums">
                        {toPersianDigits(c.usedCount ?? 0)}
                        <span className="text-muted-foreground">از</span>
                        {c.usageLimit != null ? (
                          toPersianDigits(c.usageLimit)
                        ) : (
                          <InfinityIcon className="h-4 w-4 text-muted-foreground" aria-label="نامحدود" />
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      ویرایش
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        loading={busy}
                        onClick={() => toggleActive(c)}
                      >
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                        {c.isActive === false ? 'فعال‌سازی' : 'غیرفعال'}
                      </Button>
                      <IconButton
                        label={`حذف کد ${c.code}`}
                        icon={<Trash2 />}
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(c)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CouponFormDialog open={formOpen} onOpenChange={setFormOpen} coupon={editing} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title="حذف این کد تخفیف؟"
        description={
          deleting
            ? `کد «${deleting.code}» حذف می‌شود. سفارش‌هایی که قبلاً با آن ثبت شده‌اند دست‌نخورده می‌مانند.`
            : undefined
        }
        confirmLabel="بله، حذف کن"
        destructive
        loading={deleteCoupon.isPending}
        icon={<Trash2 />}
        onConfirm={confirmDelete}
      />
    </>
  );
}
