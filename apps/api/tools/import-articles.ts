// Import WordPress posts as magazine articles.
//
//   pnpm --filter api migrate:articles
//   pnpm --filter api migrate:articles -- --dry-run
//
// Input: data/exports/posts.json (WP REST shape with _embed, from migrate:export-wp)
// plus post-categories.json for the id → name/slug map. Post slugs are preserved
// so /blog/<slug> answers the old post URLs (with the 301 map from build-redirects).
import { prisma } from '../src/lib/prisma';
import { readExport } from './migration-utils';

interface WpPost {
  id: number;
  slug: string;
  status: string;
  date: string;
  link?: string;
  title?: { rendered: string };
  content?: { rendered: string };
  excerpt?: { rendered: string };
  categories?: number[];
  _embedded?: {
    author?: Array<{ name: string }>;
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

interface WpCategory {
  id: number;
  name: string;
  slug: string;
}

const dryRun = process.argv.includes('--dry-run');

function stripHtml(html: string | undefined): string {
  return (html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function run() {
  const posts = readExport<WpPost>('posts.json');
  const categories = readExport<WpCategory>('post-categories.json');
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  let created = 0;
  let updated = 0;

  for (const post of posts) {
    const categoryId = post.categories?.[0];
    const data = {
      slug: post.slug || `post-${post.id}`,
      title: stripHtml(post.title?.rendered) || `پست ${post.id}`,
      excerpt: stripHtml(post.excerpt?.rendered) || null,
      content: post.content?.rendered ?? '',
      category: categoryId ? (categoryById.get(categoryId)?.slug ?? 'general') : 'general',
      coverImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
      tags: [] as string[],
      author: post._embedded?.author?.[0]?.name ?? null,
      publishedAt: post.date ? new Date(post.date) : new Date(),
      isActive: post.status === 'publish',
    };

    const found = await prisma.article.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (found) {
      updated++;
      if (!dryRun) await prisma.article.update({ where: { id: found.id }, data });
    } else {
      created++;
      if (!dryRun) await prisma.article.create({ data });
    }
  }

  console.log(JSON.stringify({ total: posts.length, created, updated, dryRun }, null, 2));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
