'use client';

import type { Product } from '@technokhan/shared';
import { ProductGrid } from '@/components/storefront/product-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function HomeProductTabs({ products }: { products: Product[] }) {
  const popular = [...products].sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0)).slice(0, 4);
  const newest = [...products].sort((a, b) => Date.parse(b.createdAt as string) - Date.parse(a.createdAt as string)).slice(0, 4);
  const editors = products.filter((product) => product.editorChoice).slice(0, 4);

  return (
    <Tabs defaultValue="popular">
      <TabsList label="ویترین محصولات منتخب"><TabsTrigger value="popular">پرفروش‌ترین‌ها</TabsTrigger><TabsTrigger value="newest">جدیدترین گجت‌ها</TabsTrigger><TabsTrigger value="editors">منتخب سردبیر</TabsTrigger></TabsList>
      <TabsContent value="popular"><ProductGrid products={popular} /></TabsContent>
      <TabsContent value="newest"><ProductGrid products={newest} /></TabsContent>
      <TabsContent value="editors"><ProductGrid products={editors} /></TabsContent>
    </Tabs>
  );
}
