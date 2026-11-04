import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getCountdown } from './countdown';

describe('getCountdown', () => {
  it('returns day/hour/minute/second parts and clamps expired deals', () => {
    assert.deepEqual(getCountdown('2026-11-10T10:00:00.000Z', Date.parse('2026-11-08T08:30:40.000Z')), { days: 2, hours: 1, minutes: 29, seconds: 20, expired: false });
    assert.deepEqual(getCountdown('2026-11-01T00:00:00.000Z', Date.parse('2026-11-02T00:00:00.000Z')), { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
  });
});
