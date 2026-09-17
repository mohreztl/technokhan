'use client';

import * as React from 'react';
import { Mail, MailOpen, MessageSquare, Phone } from 'lucide-react';
import type { ContactMessage } from '@autolounge/shared';
import { formatJalaliDateTime } from '@/lib/jalali';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { phoneFa } from './format';

export interface MessageDetailSheetProps {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (id: string) => void;
  marking?: boolean;
}

/** Full contact message with call / SMS / e-mail shortcuts and a mark-as-read action. */
export function MessageDetailSheet({ message, open, onOpenChange, onMarkRead, marking = false }: MessageDetailSheetProps) {
  const m = message;
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={m?.subject ?? 'پیام'}
      description={m ? formatJalaliDateTime(m.createdAt) : undefined}
      snapPoints={[0.7, 0.92]}
      desktopClassName="max-w-xl"
      footer={
        m && (
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              بستن
            </Button>
            <Button
              type="button"
              disabled={m.isRead}
              loading={marking}
              loadingText="در حال ثبت…"
              onClick={() => onMarkRead(m.id)}
              className="gap-2"
            >
              <MailOpen className="h-4 w-4" aria-hidden="true" />
              {m.isRead ? 'خوانده شده' : 'علامت‌گذاری خوانده‌شده'}
            </Button>
          </div>
        )
      }
    >
      {m && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <Avatar size="lg" fallback={m.name.charAt(0)} className="ring-2 ring-secondary/50" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-foreground">{m.name}</p>
                {!m.isRead && (
                  <Badge variant="secondary" size="sm">
                    جدید
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {phoneFa(m.phone)}
              </p>
              {m.email && (
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {m.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={`tel:${m.phone}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                تماس
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={`sms:${m.phone}`}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                پیامک
              </a>
            </Button>
            {m.email ? (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`پاسخ: ${m.subject}`)}`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  ایمیل
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5" disabled>
                <Mail className="h-4 w-4" aria-hidden="true" />
                ایمیل
              </Button>
            )}
          </div>

          <div className="rounded-2xl bg-background-secondary/70 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">متن پیام</p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{m.message}</p>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}
