'use client';

import Link from 'next/link';
import { Bell, CheckCheck, ChevronLeft, CreditCard, Package } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/store/notification-store';
import { timeAgoFa } from '@/lib/jalali';
import { cn } from '@/lib/utils';

export function TabNotifications() {
  const { items, unread, markRead, markAllRead } = useNotifications();

  return (
    <section className="space-y-4" aria-labelledby="notifications-title">
      <div className="flex items-center justify-between gap-3">
        <div><h2 id="notifications-title" className="text-lg font-bold">اعلان‌های حساب</h2><p className="mt-1 text-xs text-muted-foreground">{unread ? `${toPersianDigits(unread)} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده‌اند'}</p></div>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="size-4" aria-hidden="true" />خواندم</Button>}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center"><Bell className="size-12 text-secondary" aria-hidden="true" /><p className="font-bold">اعلان جدیدی ندارید</p><p className="text-sm text-muted-foreground">تغییر وضعیت سفارش و پرداخت اینجا نمایش داده می‌شود.</p></div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item) => {
            const Icon = item.kind === 'payment' ? CreditCard : Package;
            return (
              <li key={item.id} className="border-b border-border last:border-0">
                <Link href={item.href} onClick={() => markRead(item.id)} className={cn('flex min-h-24 items-start gap-3 p-4 transition-colors hover:bg-muted/50', !item.read && 'bg-secondary/[0.06]')}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><strong className="text-sm">{item.title}</strong>{!item.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-secondary" aria-label="خوانده‌نشده" />}</span><span className="mt-1 block text-xs leading-6 text-muted-foreground">{item.body}</span><span className="mt-1 block text-[11px] text-muted-foreground">{timeAgoFa(item.createdAt)}</span></span>
                  <ChevronLeft className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
