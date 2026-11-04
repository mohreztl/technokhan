import { HomePage } from '@/components/home/home-page';
import { getArticles, getProducts } from '@/lib/data/repository';

/** Persian storefront landing page with server-loaded catalog and editorial content. */
export default async function Page() {
  const [productResult, articles] = await Promise.all([getProducts({ limit: 50 }), getArticles({ limit: 3 })]);
  return <HomePage products={productResult.data.items} articles={articles} />;
}
