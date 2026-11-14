// Build the SEO redirect table: every old WordPress URL → its new route.
//
//   pnpm --filter api migrate:redirects
//
// Input: data/exports/all-urls.txt (JSON array of full old URLs, from migrate:export-wp;
// a WP-CLI `wp post list --field=url` output converted to JSON works too).
// Outputs next to it:
//   redirects.conf      — nginx map body: "/old/path" "/new/path";
//   next-redirects.json — [{ source, destination, permanent }] for middleware use.
//
// Rules (see docs/wordpress-migration.md §۵):
//   /product/<slug>          → same path, skipped (the slug is preserved)
//   /product-category/<slug> → /category/<slug>
//   /category/<slug>         → /blog?category=<slug>   (post categories)
//   /tag/<slug>              → /blog
//   posts (matched by slug)  → /blog/<slug>
//   pages  (matched by slug) → /<slug>
//   anything unmatched       → /blog (fallback, listed in redirects-unmatched.txt)
import fs from 'node:fs';
import path from 'node:path';
import { EXPORT_DIR, readExport, WP_URL } from './migration-utils';

interface WpPostLike {
  slug?: string;
  link?: string;
}

function normalizePath(raw: string): { path: string; trailingSlash: boolean } {
  let pathname = raw;
  try {
    pathname = new URL(raw).pathname;
  } catch {
    // already a path
  }
  const trailingSlash = pathname.endsWith('/');
  const clean = pathname.replace(/\/+$/, '');
  return { path: clean || '/', trailingSlash };
}

async function run() {
  const rawUrls = readExport<string>('all-urls.txt');
  const oldHost = WP_URL ? new URL(WP_URL).host : null;

  // Slug indexes for one-to-one post/page mapping.
  const posts = readExport<WpPostLike>('posts.json');
  const pages = readExport<WpPostLike>('pages.json');
  const postSlugs = new Set(posts.map((p) => p.slug).filter(Boolean));
  const pageSlugs = new Set(pages.map((p) => p.slug).filter(Boolean));

  const map = new Map<string, string>();
  const unmatched: string[] = [];

  for (const raw of rawUrls) {
    let host: string | null = null;
    let pathPart = raw;
    try {
      const url = new URL(raw);
      host = url.host;
      pathPart = url.pathname + url.search;
    } catch {
      // plain path
    }
    if (oldHost && host && host !== oldHost) continue;

    const { path } = normalizePath(pathPart);
    const segments = path.split('/').filter(Boolean);
    const [first, second] = segments;

    let target: string | null = null;
    if (first === 'product' && second) {
      continue; // slug preserved — no redirect needed (the SEO win)
    }
    if (first === 'product-category' && second) {
      target = `/category/${second}`;
    } else if (first === 'category' && second) {
      target = `/blog?category=${second}`;
    } else if (first === 'tag' && second) {
      target = '/blog';
    } else if (segments.length === 1) {
      const slug = segments[0]!;
      if (postSlugs.has(slug)) target = `/blog/${slug}`;
      else if (pageSlugs.has(slug)) target = `/${slug}`;
    }
    if (first === 'author' || first === 'feed' || first === 'comments') {
      target = '/blog';
    }

    if (!target) {
      unmatched.push(raw);
      target = '/blog';
    }
    map.set(path, target);
  }

  const nginx = [...map.entries()].map(([from, to]) => `"${from}" "${to}";`).join('\n');
  const next = [...map.entries()].map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  }));

  fs.writeFileSync(path.join(EXPORT_DIR, 'redirects.conf'), nginx + '\n');
  fs.writeFileSync(path.join(EXPORT_DIR, 'next-redirects.json'), JSON.stringify(next, null, 2));
  fs.writeFileSync(path.join(EXPORT_DIR, 'redirects-unmatched.txt'), unmatched.join('\n') + '\n');
  console.log(JSON.stringify({ urls: rawUrls.length, redirects: map.size, unmatched: unmatched.length }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
