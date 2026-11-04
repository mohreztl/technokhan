import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CouponTerms, Product } from '@autolounge/shared';
import { computeOrderTotals } from '@autolounge/shared';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  /**
   * The coupon definition the API returned when the code was accepted. Kept so
   * the cart can re-price itself locally as items change; the server validates
   * again when the order is placed, and that answer is the binding one.
   */
  coupon: CouponTerms | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCoupon: (code: string | null, coupon?: CouponTerms | null) => void;
}

export const CART_STORAGE_KEY = 'technokhan_cart';

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      coupon: null,
      addItem: (product, quantity = 1) =>
        set((s) => {
          if (product.stock <= 0) return s;
          const existing = s.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) }
                  : i
              ),
            };
          }
          return { items: [...s.items, { product, quantity: Math.max(1, Math.min(product.stock, quantity)) }] };
        }),
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) => i.product.id === productId ? { ...i, quantity: Math.min(i.product.stock, quantity) } : i)
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [], couponCode: null, coupon: null }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCoupon: (code, coupon) =>
        set({ couponCode: code ? code.trim().toUpperCase() : null, coupon: code ? coupon ?? null : null }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode, coupon: s.coupon }),
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
  const coupon = useCartStore((s) => s.coupon);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const setCoupon = useCartStore((s) => s.setCoupon);

  // Only the coupon the API vouched for: the bundled list is seed data now, and
  // pricing a cart against it would quietly ignore whatever an admin has changed.
  const totals = computeOrderTotals(items, couponCode, coupon ? [coupon] : []);

  return {
    state: { items, isOpen },
    items,
    isOpen,
    couponCode,
    coupon,
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
