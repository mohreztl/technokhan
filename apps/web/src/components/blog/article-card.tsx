import Image from 'next/image';
import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { toPersianDigits, type Article } from '@technokhan/shared';
import { formatJalali } from '@/lib/jalali';
import { ARTICLE_MEDIA } from '@/content/media-assets';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Editorial magazine card with local cover art, reading time and Persian publication date. */
export function ArticleCard({ article, priority = false, featured = false, className }: { article: Article; priority?: boolean; featured?: boolean; className?: string }) {
  const media = ARTICLE_MEDIA[article.slug as keyof typeof ARTICLE_MEDIA];
  return (
    <article className={cn('group overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-foreground/20', featured && 'border-secondary/45', className)}>
      <Link href={`/blog/${article.slug}`} className="relative block aspect-[3/2] overflow-hidden">
        <Image src={article.cover} alt={media?.alt ?? article.title} fill priority={priority} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        <Badge className="absolute inset-s-4 top-4" variant="original">{article.category}</Badge>
      </Link>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-3 text-[11px] text-muted-foreground"><span>{formatJalali(article.publishedAt)}</span><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" aria-hidden="true" /> {toPersianDigits(article.readingMinutes)} دقیقه مطالعه</span></div>
        <h2 className="text-balance text-lg font-black leading-8"><Link href={`/blog/${article.slug}`} className="hover:text-secondary">{article.title}</Link></h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
      </div>
    </article>
  );
}
