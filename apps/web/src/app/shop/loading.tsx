import { Skeleton } from '@/components/ui/skeleton';

/** Static loading shell that preserves the shop filter and product-grid layout. */
export default function ShopLoading() {
  return <div className="container-custom grid gap-7 py-10 lg:grid-cols-[260px_1fr]"><Skeleton className="hidden h-[560px] rounded-2xl lg:block" /><div><Skeleton className="mb-6 h-14 rounded-2xl" /><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="aspect-[0.78] rounded-2xl" />)}</div></div></div>;
}
