import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock3, Tag } from 'lucide-react';
import {
  ARTICLES,
  ROUTES,
  findArticle,
  findProduct,
  getRelatedArticles,
  toPersianDigits,
} from '@technokhan/shared';
import { absoluteUrl } from '@/lib/site';
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { formatJalali } from '@/lib/jalali';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ArticleBody } from '@/components/blog/article-body';
import { ArticleCard } from '@/components/blog/article-card';
import { ArticleToc } from '@/components/blog/article-toc';
import { ShareRow } from '@/components/blog/share-row';

type Params = Promise<{ slug: string }>;

// Articles are bundled, so every one of them can be prerendered; anything else
// under this route does not exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: 'مقاله یافت نشد', robots: { index: false, follow: false } };

  const path = `${ROUTES.BLOG}/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: path },
    keywords: article.tags,
    authors: [{ name: article.author.name }],
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url: path,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author.name],
      tags: article.tags,
      images: [{ url: absoluteUrl(article.cover), alt: article.title }],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const path = `${ROUTES.BLOG}/${article.slug}`;
  const related = getRelatedArticles(article.slug, 3);
  const headings = article.body.filter((b) => b.kind === 'heading');
  const products = (article.relatedProductIds ?? []).map(findProduct).filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(article, absoluteUrl(path)),
          breadcrumbJsonLd([
            { name: 'خانه', href: ROUTES.HOME },
            { name: 'مجله', href: ROUTES.BLOG },
            { name: article.title, href: path },
          ]),
        ]}
      />

      <div className="container-custom py-6 lg:py-10">
        <Breadcrumb
          items={[
            { label: 'خانه', href: ROUTES.HOME },
            { label: 'مجله', href: ROUTES.BLOG },
            { label: article.title },
          ]}
          className="mb-5"
        />

        <article>
          <header className="mx-auto max-w-3xl text-center">
            <Badge variant="gold">{article.category}</Badge>
            <h1 className="mt-4 text-2xl font-black text-foreground text-balance sm:text-4xl sm:leading-tight">
              {article.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">{article.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-2">
                <Avatar size="sm" src={article.author.avatar} fallback={article.author.name.charAt(0)} />
                <span className="text-start">
                  <span className="block font-bold text-foreground">{article.author.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{article.author.role}</span>
                </span>
              </span>
              <span aria-hidden="true" className="h-8 w-px bg-border" />
              <span className="text-muted-foreground">
                <time dateTime={article.publishedAt}>{formatJalali(new Date(article.publishedAt))}</time>
              </span>
              <span aria-hidden="true" className="h-8 w-px bg-border" />
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {toPersianDigits(article.readingMinutes)} دقیقه مطالعه
              </span>
            </div>
          </header>

          <div className="relative mx-auto mt-8 aspect-16/9 max-w-4xl overflow-hidden rounded-3xl border border-border">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-start">
            <div className="min-w-0">
              <ArticleBody blocks={article.body} />

              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>

              <ShareRow title={article.title} path={path} className="mt-6" />
            </div>

            {headings.length > 1 && (
              <aside className="lg:sticky lg:top-28">
                <ArticleToc headings={headings.map((h) => ({ id: h.id, text: h.text }))} />
              </aside>
            )}
          </div>
        </article>

        {products.length > 0 && (
          <section aria-labelledby="article-related-catalog" className="mx-auto mt-14 max-w-5xl">
            <h2 id="article-related-catalog" className="mb-4 text-lg font-black text-foreground">
              مرتبط با این مقاله
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <CatalogLink
                  key={p!.id}
                  href={`/product/${p!.id}`}
                  eyebrow="محصول"
                  title={p!.name}
                  description={p!.shortDescription ?? p!.description.slice(0, 90)}
                />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="article-related" className="mx-auto mt-14 max-w-5xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="article-related" className="text-lg font-black text-foreground">
                بیشتر بخوانید
              </h2>
              <Link
                href={ROUTES.BLOG}
                className="link-hover inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
              >
                همهٔ مقاله‌ها
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} className="h-full" />
              ))}
            </div>
          </section>
        )}

        <div className="mx-auto mt-12 max-w-5xl">
          <Button asChild variant="outline" className="gap-2">
            <Link href={ROUTES.BLOG}>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              بازگشت به مجله
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function CatalogLink({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-secondary/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-semibold text-secondary-800 dark:text-secondary-300">{eyebrow}</span>
        <p className="mt-0.5 font-bold text-foreground">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{description}</p>
      </div>
      <ArrowLeft
        className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}
