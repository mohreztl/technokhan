import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { PRODUCTS } from '@autolounge/shared';
import { useCartStore } from './cart-store';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => { memory.set(key, value); },
  removeItem: (key: string) => { memory.delete(key); },
  clear: () => memory.clear(),
  key: (index: number) => [...memory.keys()][index] ?? null,
  get length() { return memory.size; },
} });

describe('cart stock boundaries', () => {
  beforeEach(() => useCartStore.setState({ items: [], isOpen: false, couponCode: null, coupon: null }));

  it('caps both additions and direct quantity updates at available stock', () => {
    const product = { ...PRODUCTS[0]!, stock: 2 };
    useCartStore.getState().addItem(product, 3);
    assert.equal(useCartStore.getState().items[0]?.quantity, 2);
    useCartStore.getState().updateQuantity(product.id, 99);
    assert.equal(useCartStore.getState().items[0]?.quantity, 2);
  });

  it('does not add an out-of-stock product', () => {
    const product = { ...PRODUCTS[0]!, stock: 0 };
    useCartStore.getState().addItem(product);
    assert.equal(useCartStore.getState().items.length, 0);
  });
});
