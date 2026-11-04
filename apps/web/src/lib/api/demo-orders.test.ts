import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { demoOrders, resetDemoData } from './demo';
import { useAuthStore } from '@/lib/store/auth-store';

const address = { fullName: 'مریم رضایی', phoneNumber: '09120000000', province: 'تهران', city: 'تهران', address: 'آدرس نمونه', postalCode: '1234567890' };

describe('demo order warranty pricing', () => {
  beforeEach(() => {
    resetDemoData();
    useAuthStore.setState({ user: { id: 'test-user', phoneNumber: '09120000000', name: 'مریم رضایی', role: 'customer', createdAt: '2026-01-01', updatedAt: '2026-01-01' }, status: 'authenticated', token: 'test' });
  });

  it('charges the catalog warranty delta instead of the base price', async () => {
    const result = await demoOrders.create({
      items: [{ productId: 'gan-charger', quantity: 1, selection: { warrantyId: 'extended-24', warrantyTitle: 'گارانتی تعویض ۲۴ ماهه تکنو خان', colorName: 'گرافیت' } }],
      shippingAddress: address,
      paymentMethod: 'cod',
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.totalPrice, 5_120_000);
    assert.equal(result.data.items[0]?.price, 5_120_000);
    assert.equal(result.data.items[0]?.selection?.warrantyId, 'extended-24');
  });

  it('honors the effective unit price supplied by the current cart in demo mode', async () => {
    const result = await demoOrders.create({
      items: [{ productId: 'gan-charger', quantity: 1, unitPrice: 5_120_000, selection: { warrantyId: 'extended-24' } }],
      shippingAddress: address,
      paymentMethod: 'cod',
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.totalPrice, 5_120_000);
  });
});
