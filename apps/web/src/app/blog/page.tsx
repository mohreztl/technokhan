import type { Metadata } from 'next';
import { BlogIndexClient } from '@/components/blog/blog-index-client';
import { getArticles } from '@/lib/data/repository';

export const metadata: Metadata = {
  title: 'مجله تکنو خان | راهنمای گجت و فناوری',
  description: 'مقاله‌های کاربردی درباره شارژ GaN، نویزکنسلینگ، پاوربانک، میز کار و انتخاب لوازم جانبی دیجیتال.',
  alternates: { canonical: '/blog' },
};

/** Magazine index loaded from the same Fastify/bundled editorial source. */
export default async function BlogPage() {
  const articles = await getArticles({ limit: 20 });
  return <BlogIndexClient articles={articles} />;
}
