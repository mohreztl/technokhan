import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CouponTerms, OrderItemSelection, Product } from '@technokhan/shared';
import { computeOrderTotals } from '@technokhan/shared';

export type ProductSelection = OrderItemSelection;

export interface CartItem {
  product: Product;
  quantity: number;
  selection?: ProductSelection;
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
  addItem: (product: Product, quantity?: number, selection?: ProductSelection) => void;
  removeItem: (productId: string, selection?: ProductSelection) => void;
  updateQuantity: (productId: string, quantity: number, selection?: ProductSelection) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCoupon: (code: string | null, coupon?: CouponTerms | null) => void;
}

export const CART_STORAGE_KEY = 'technokhan_cart';

/** Stable identity for a product with a specific color and warranty. */
export function cartItemKey(item: Pick<CartItem, 'product' | 'selection'>): string {
  return [item.product.id, item.selection?.colorName ?? '', item.selection?.warrantyId ?? item.selection?.warrantyTitle ?? ''].join('::');
}

function sameVariant(item: CartItem, productId: string, selection?: ProductSelection): boolean {
  return item.product.id === productId
    && item.selection?.colorName === selection?.colorName
    && (item.selection?.warrantyId ?? item.selection?.warrantyTitle) === (selection?.warrantyId ?? selection?.warrantyTitle);
}

function quantityOutsideVariant(items: CartItem[], productId: string, selection?: ProductSelection): number {
  return items
    .filter((item) => item.product.id === productId && !sameVariant(item, productId, selection))
    .reduce((total, item) => total + item.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      coupon: null,
      addItem: (product, quantity = 1, selection) =>
        set((state) => {
          if (product.stock <= 0) return state;
          const available = Math.max(0, product.stock - quantityOutsideVariant(state.items, product.id, selection));
          if (available <= 0) return state;
          const existing = state.items.some((item) => sameVariant(item, product.id, selection));
          if (existing) {
            return {
              items: state.items
                .map((item) => sameVariant(item, product.id, selection) ? { ...item, quantity: Math.min(available, item.quantity + quantity) } : item)
                .filter((item) => item.quantity > 0),
            };
          }
          return { items: [...state.items, { product, quantity: Math.max(1, Math.min(available, quantity)), selection }] };
        }),
      removeItem: (productId, selection) =>
        set((state) => ({ items: state.items.filter((item) => !sameVariant(item, productId, selection)) })),
      updateQuantity: (productId, quantity, selection) =>
        set((state) => {
          const stock = state.items.find((item) => item.product.id === productId)?.product.stock;
          if (stock === undefined) return state;
          const available = Math.max(0, stock - quantityOutsideVariant(state.items, productId, selection));
          return {
            items: state.items
              .map((item) => sameVariant(item, productId, selection) ? { ...item, quantity: Math.max(0, Math.min(available, quantity)) } : item)
              .filter((item) => item.quantity > 0),
          };
        }),
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
    quantityOf: (productId: string) => items.filter((item) => item.product.id === productId).reduce((total, item) => total + item.quantity, 0),
  };
}

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
