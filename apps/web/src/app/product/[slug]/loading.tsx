import { Skeleton } from '@/components/ui/skeleton';

/** Product detail loading shell matching the gallery and purchase panels. */
export default function ProductLoading() {
  return <div className="container-custom grid gap-8 py-8 lg:grid-cols-2"><Skeleton className="aspect-square rounded-3xl" /><div className="space-y-5"><Skeleton className="h-6 w-32" /><Skeleton className="h-12 w-4/5" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-28 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-12 w-full" /></div></div>;
}
