import type { ProductListQuery } from '@technokhan/shared';

/** Centralized React Query keys */
export const qk = {
  products: (q?: ProductListQuery) => ['products', q ?? {}] as const,
  product: (id: string) => ['product', id] as const,
  relatedProducts: (id: string) => ['product', id, 'related'] as const,
  featuredProducts: () => ['products', 'featured'] as const,
  me: () => ['me'] as const,
  orders: () => ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  addresses: () => ['addresses'] as const,
  paymentStatus: (orderId: string) => ['payment', orderId] as const,
  settings: () => ['settings'] as const,
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    products: (q?: Record<string, unknown>) => ['admin', 'products', q ?? {}] as const,
    orders: (q?: Record<string, unknown>) => ['admin', 'orders', q ?? {}] as const,
    order: (id: string) => ['admin', 'order', id] as const,
    users: (q?: Record<string, unknown>) => ['admin', 'users', q ?? {}] as const,
    user: (id: string) => ['admin', 'user', id] as const,
    messages: (q?: Record<string, unknown>) => ['admin', 'messages', q ?? {}] as const,
    reviews: (q?: Record<string, unknown>) => ['admin', 'reviews', q ?? {}] as const,
    coupons: () => ['admin', 'coupons'] as const,
    settings: () => ['admin', 'settings'] as const,
  },
};
