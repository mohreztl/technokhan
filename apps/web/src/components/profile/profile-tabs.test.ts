import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PROFILE_TABS } from './profile-tabs';

test('keeps automotive bookings and garage out of the customer profile', () => {
  assert.deepEqual(PROFILE_TABS.map((tab) => tab.key), ['overview', 'orders', 'addresses', 'wishlist', 'settings']);
});
