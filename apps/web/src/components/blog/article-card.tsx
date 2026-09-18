import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';
import { ROUTES, toPersianDigits } from '@autolounge/shared';
import type { Article } from '@autolounge/shared';
import { Badge } from '@/components/ui/badge';
import { formatJalali } from '@/lib/jalali';
import { cn } from '@/lib/utils';

export interface ArticleCardProps {
  article: Article;
  /** Wider layout with the cover beside the text — used for the lead story. */
  featured?: boolean;
  className?: string;
}

export function ArticleCard({ article, featured = false, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        'group relative flex overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-shadow hover:shadow-luxury',
        featured ? 'flex-col md:flex-row' : 'flex-col',
        className
      )}
    >
      <div className={cn('relative shrink-0 overflow-hidden', featured ? 'aspect-16/9 md:aspect-auto md:w-1/2' : 'aspect-16/9')}>
        <Image
          src={article.cover}
          alt=""
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-s-3 top-3">
          <Badge variant="gold" className="backdrop-blur">
            {article.category}
          </Badge>
        </span>
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col p-4 sm:p-5', featured && 'md:justify-center md:p-7')}>
        <h3 className={cn('font-black text-foreground text-balance', featured ? 'text-xl sm:text-2xl' : 'text-base')}>
          {/* The whole card is the link target; the overlay keeps the accessible name on the title. */}
          <Link href={`${ROUTES.BLOG}/${article.slug}`} className="after:absolute after:inset-0 focus-visible:outline-hidden">
            {article.title}
          </Link>
        </h3>
        <p className={cn('mt-2 text-sm leading-7 text-muted-foreground', featured ? 'line-clamp-3' : 'line-clamp-2')}>
          {article.excerpt}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>{article.author.name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>{formatJalali(new Date(article.publishedAt))}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {toPersianDigits(article.readingMinutes)} دقیقه
          </span>
        </div>

        {featured && (
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            خواندن مقاله
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          </span>
        )}
      </div>
    </article>
  );
}
