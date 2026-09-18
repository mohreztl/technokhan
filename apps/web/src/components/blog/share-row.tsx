'use client';

import { Share2 } from 'lucide-react';
import { TelegramIcon, WhatsappIcon } from '@/components/icons/brands';
import { Button } from '@/components/ui/button';
import { shareOrCopy } from '@/components/catalog/share-button';
import { absoluteUrl } from '@/lib/site';
import { cn } from '@/lib/utils';

export interface ShareRowProps {
  title: string;
  /** Site-relative path of the article. */
  path: string;
  className?: string;
}

/** Share targets for an article: the OS sheet, plus the two apps people here actually use. */
export function ShareRow({ title, path, className }: ShareRowProps) {
  const url = absoluteUrl(path);
  const text = `${title}\n${url}`;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="me-1 text-sm font-semibold text-muted-foreground">این مقاله را به اشتراک بگذارید:</span>
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => void shareOrCopy({ title, url })}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        اشتراک‌گذاری
      </Button>
      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          <WhatsappIcon className="h-4 w-4" aria-hidden="true" />
          واتس‌اپ
        </a>
      </Button>
      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TelegramIcon className="h-4 w-4" aria-hidden="true" />
          تلگرام
        </a>
      </Button>
    </div>
  );
}
