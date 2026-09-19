import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ROUTES, sortedArticles } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { ArticleCard } from '@/components/blog/article-card';

export interface MagazineTeaserProps {
  /** How many pieces to show (default 3). */
  limit?: number;
}

/** Newest magazine pieces, featured ones first. */
export function MagazineTeaser({ limit = 3 }: MagazineTeaserProps) {
  const all = sortedArticles();
  const articles = [...all]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, limit);
  if (articles.length === 0) return null;

  return (
    <section className="py-16 lg:py-24" aria-labelledby="magazine-teaser-title">
      <div className="container-custom">
        <SectionHeading
          id="magazine-teaser-title"
          eyebrow="مجله"
          title="از تجربهٔ کارگاه"
          subtitle="راهنماهایی که تکنسین‌های ما نوشته‌اند — برای وقتی می‌خواهید بدانید چه چیزی به خودروتان می‌آید و چرا."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} className="h-full" />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" size="lg" className="min-h-12 gap-2">
            <Link href={ROUTES.BLOG}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              همهٔ مقاله‌ها
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
