import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@autolounge/shared';
import { COUPONS, computeOrderTotals } from '@autolounge/shared';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCoupon: (code: string | null) => void;
}

export const CART_STORAGE_KEY = 'autolounge_cart';

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      addItem: (product, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id);
          const maxQty = product.stock > 0 ? product.stock : 99;
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(maxQty, i.quantity + quantity) }
                  : i
              ),
            };
          }
          return { items: [...s.items, { product, quantity: Math.min(maxQty, quantity) }] };
        }),
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.product.id !== productId)
              : s.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [], couponCode: null }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCoupon: (code) => set({ couponCode: code ? code.trim().toUpperCase() : null }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
      skipHydration: true,
      // legacy format was a bare CartItem[] under the same key
      merge: (persisted, current) => {
        if (Array.isArray(persisted)) return { ...current, items: persisted as CartItem[] };
        return { ...current, ...(persisted as Partial<CartState>) };
      },
    }
  )
);

/** Legacy-compatible hook: `{ state, addItem, ..., totalItems, totalPrice, discountedPrice }` + totals */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const couponCode = useCartStore((s) => s.couponCode);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const setCoupon = useCartStore((s) => s.setCoupon);

  const totals = computeOrderTotals(items, couponCode, COUPONS);

  return {
    state: { items, isOpen },
    items,
    isOpen,
    couponCode,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    setCoupon,
    totals,
    totalItems: totals.count,
    /** list-price total */
    totalPrice: totals.listTotal,
    /** effective (discounted) subtotal */
    discountedPrice: totals.subtotal,
    isInCart: (productId: string) => items.some((i) => i.product.id === productId),
    quantityOf: (productId: string) => items.find((i) => i.product.id === productId)?.quantity ?? 0,
  };
}

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
