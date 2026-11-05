import Image from 'next/image';
import { Lightbulb, TriangleAlert } from 'lucide-react';
import type { ArticleBlock } from '@technokhan/shared';
import { toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';

/**
 * Renders the structured article body. A server component on purpose: the
 * article is static text, and shipping a renderer to the browser for it would
 * be pure cost.
 */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.kind) {
    case 'heading':
      return (
        <h2
          id={block.id}
          className="scroll-mt-28 pt-4 text-xl font-black text-foreground text-balance sm:text-2xl"
        >
          {block.text}
        </h2>
      );

    case 'paragraph':
      return <p className="text-[15px] leading-9 text-foreground/90 sm:text-base">{block.text}</p>;

    case 'list':
      return block.ordered ? (
        <ol className="space-y-2 ps-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-8 text-foreground/90">
              <span
                aria-hidden="true"
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary-800 tabular-nums dark:text-secondary-300"
              >
                {toPersianDigits(i + 1)}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2 ps-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-8 text-foreground/90">
              <span aria-hidden="true" className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'quote':
      return (
        <blockquote className="relative rounded-2xl border-s-4 border-secondary bg-secondary/5 px-5 py-4">
          <p className="text-base leading-8 font-semibold text-foreground text-balance">«{block.text}»</p>
          {block.attribution && (
            <footer className="mt-2 text-xs text-muted-foreground">— {block.attribution}</footer>
          )}
        </blockquote>
      );

    case 'callout': {
      const tip = block.tone === 'tip';
      const Icon = tip ? Lightbulb : TriangleAlert;
      return (
        <aside
          className={cn(
            'flex gap-3 rounded-2xl border p-4',
            tip ? 'border-secondary/40 bg-secondary/10' : 'border-warning/40 bg-warning/10'
          )}
        >
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              tip ? 'bg-secondary/20 text-secondary-800 dark:text-secondary-300' : 'bg-warning/20 text-warning-foreground'
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground">{block.title}</p>
            <p className="mt-1 text-sm leading-7 text-foreground/85">{block.text}</p>
          </div>
        </aside>
      );
    }

    case 'image':
      return (
        <figure className="overflow-hidden rounded-2xl border border-border">
          <div className="relative aspect-16/9">
            <Image src={block.src} alt={block.alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
          </div>
          {block.caption && (
            <figcaption className="bg-card px-4 py-2.5 text-xs text-muted-foreground">{block.caption}</figcaption>
          )}
        </figure>
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground tabular-nums"
              >
                {toPersianDigits(i + 1)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-foreground">{step.title}</p>
                <p className="mt-1 text-sm leading-7 text-foreground/85">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
  }
}
