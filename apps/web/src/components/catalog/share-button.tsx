'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { IconButton, type IconButtonProps } from '@/components/ui/icon-button';
import { showToast } from '@/components/ui/toaster';

export interface SharePayload {
  title: string;
  text?: string;
  /** Defaults to the current page URL. */
  url?: string;
}

/** Web Share API with a copy-link fallback (toast on both paths). */
export async function shareOrCopy(payload: SharePayload): Promise<void> {
  const url = payload.url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;

  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share({ title: payload.title, text: payload.text, url });
      showToast.shareSuccess();
      return;
    } catch (err) {
      // User dismissed the share sheet — not an error worth reporting.
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }

  try {
    if (!nav?.clipboard) throw new Error('clipboard unavailable');
    await nav.clipboard.writeText(url);
    showToast.success('لینک کپی شد', 'می‌توانید آن را برای دوستان خود بفرستید.');
  } catch {
    showToast.error('امکان اشتراک‌گذاری وجود ندارد', 'لطفاً آدرس صفحه را به‌صورت دستی کپی کنید.');
  }
}

export interface ShareButtonProps extends Omit<IconButtonProps, 'label' | 'icon' | 'onClick'> {
  payload: SharePayload;
  label?: string;
}

export function ShareButton({ payload, label = 'اشتراک‌گذاری', ...props }: ShareButtonProps) {
  return (
    <IconButton
      label={label}
      icon={<Share2 />}
      variant="outline"
      onClick={() => void shareOrCopy(payload)}
      {...props}
    />
  );
}
