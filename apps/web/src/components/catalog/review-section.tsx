'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Send } from 'lucide-react';
import { reviewSchema, toPersianDigits, type Review } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { formatJalali } from '@/lib/jalali';
import { productsApi, servicesApi } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/store/auth-store';
import { useRequireAuth } from '@/components/auth/login-sheet';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/components/ui/toaster';
import { RatingStars, StarPicker } from './rating-stars';

export interface ReviewSectionProps {
  kind: 'product' | 'service';
  targetId: string;
  reviews: Review[];
  rating?: number;
  reviewCount?: number;
  className?: string;
}

type ReviewValues = z.infer<typeof reviewSchema>;

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

function safeDate(value: string | Date): string {
  try {
    return formatJalali(value);
  } catch {
    return '';
  }
}

const isoDate = (value: string | Date): string =>
  typeof value === 'string' ? value : value.toISOString();

/** Rating summary, approved reviews and a submit form gated by auth. */
export function ReviewSection({ kind, targetId, reviews, rating, reviewCount, className }: ReviewSectionProps) {
  const { status } = useAuth();
  const ensureAuth = useRequireAuth();

  const total = reviewCount ?? reviews.length;
  const average = rating ?? (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const onSubmit = async (values: ReviewValues) => {
    if (!ensureAuth()) return;
    const api = kind === 'product' ? productsApi : servicesApi;
    const result = await api.addReview(targetId, values);
    if (!result.ok) {
      showToast.error('ثبت نظر انجام نشد', result.error);
      return;
    }
    showToast.success('نظر شما ثبت شد', 'نظر شما پس از تأیید نمایش داده می‌شود.');
    form.reset({ rating: 0, comment: '' });
  };

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]', className)}>
      <div className="space-y-6">
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black text-foreground tabular-nums">{toPersianDigits(average.toFixed(1))}</span>
            <div>
              <RatingStars value={average} showValue={false} size="lg" />
              <p className="mt-1 text-sm text-muted-foreground">بر اساس {toPersianDigits(total)} نظر</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2" aria-label="توزیع امتیازها">
            {distribution.map(({ star, count }) => {
              const width = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <li key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-10 shrink-0 text-muted-foreground tabular-nums">{toPersianDigits(star)} ستاره</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-secondary" style={{ width: `${width}%` }} />
                  </span>
                  <span className="w-6 text-end text-muted-foreground tabular-nums">{toPersianDigits(count)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-card p-5" noValidate>
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
            <MessageSquare className="h-5 w-5 text-secondary" aria-hidden="true" />
            نظر خود را بنویسید
          </h3>
          {status === 'anonymous' && (
            <p className="mb-4 rounded-xl bg-muted/60 p-3 text-xs leading-6 text-muted-foreground">
              برای ثبت نظر ابتدا وارد حساب کاربری شوید.{' '}
              <button type="button" onClick={() => ensureAuth()} className="font-bold text-primary underline-offset-4 hover:underline">
                ورود / ثبت‌نام
              </button>
            </p>
          )}
          <Controller
            control={form.control}
            name="rating"
            render={({ field, fieldState }) => (
              <StarPicker
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error ? 'لطفاً امتیاز بدهید' : undefined}
                className="mb-4"
              />
            )}
          />
          <Textarea
            label="متن نظر"
            rows={4}
            placeholder="تجربهٔ خود را با دیگران به اشتراک بگذارید…"
            error={form.formState.errors.comment?.message}
            {...form.register('comment')}
          />
          <Button
            type="submit"
            variant="primary"
            loading={form.formState.isSubmitting}
            loadingText="در حال ارسال…"
            className="mt-4 min-h-12 w-full gap-2"
          >
            <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            ثبت نظر
          </Button>
        </form>
      </div>

      {/* List */}
      <div>
        <h3 className="mb-4 text-base font-bold text-foreground">
          نظرات کاربران
          <span className="ms-2 text-sm font-normal text-muted-foreground">({toPersianDigits(reviews.length)})</span>
        </h3>
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            هنوز نظری ثبت نشده است؛ اولین نفر باشید.
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Avatar fallback={initials(review.userName)} alt={review.userName} size="md" className="bg-primary/10 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-foreground">{review.userName}</p>
                      <time dateTime={isoDate(review.createdAt)} className="text-xs text-muted-foreground">
                        {safeDate(review.createdAt)}
                      </time>
                    </div>
                    <RatingStars value={review.rating} showValue={false} size="sm" className="mt-1" />
                    <p className="mt-3 text-sm leading-7 text-foreground/90">{review.comment}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
