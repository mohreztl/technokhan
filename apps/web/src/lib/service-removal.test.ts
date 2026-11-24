import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ROUTES, normalizeTrackingCode } from '@technokhan/shared';
import { ADMIN_NAV } from '@/components/admin/admin-nav';
import * as endpoints from '@/lib/api/endpoints';
import * as demo from '@/lib/api/demo';
import * as shared from '@technokhan/shared';

test('exposes only gadget routes and client APIs', () => {
  for (const legacy of ['SERVICES', 'BOOKING', 'GALLERY']) {
    assert.equal(Object.prototype.hasOwnProperty.call(ROUTES, legacy), false, `${legacy} route must be removed`);
  }
  for (const legacy of ['servicesApi', 'bookingsApi']) {
    assert.equal(Object.prototype.hasOwnProperty.call(endpoints, legacy), false, `${legacy} client API must be removed`);
  }
  for (const legacy of ['/admin/services', '/admin/bookings']) {
    assert.equal(ADMIN_NAV.some((item) => item.href === legacy), false, `${legacy} admin navigation must be removed`);
  }
});

test('rejects booking tracking codes and removes demo service registries', () => {
  assert.equal(normalizeTrackingCode('BK-ABCD'), '');
  assert.ok(normalizeTrackingCode('OR-ABCD'));
  for (const legacy of ['demoServices', 'demoBookings']) {
    assert.equal(Object.prototype.hasOwnProperty.call(demo, legacy), false, `${legacy} demo registry must be removed`);
  }
  for (const legacy of ['services', 'bookings']) {
    assert.equal(Object.prototype.hasOwnProperty.call(demo.demoAdmin, legacy), false, `demoAdmin.${legacy} must be removed`);
  }
});

test('removes automotive demo catalog exports', () => {
  for (const legacy of ['SERVICES', 'GALLERY', 'VEHICLE_CATALOG', 'WRAP_COLORS', 'TEAM', 'TESTIMONIALS', 'CERTIFICATIONS']) {
    assert.equal(Object.prototype.hasOwnProperty.call(shared, legacy), false, `${legacy} catalog export must be removed`);
  }
});
