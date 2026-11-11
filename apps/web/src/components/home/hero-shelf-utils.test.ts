import assert from 'node:assert/strict';
import { test } from 'node:test';

test('places shelf categories by the shortest wrapped offset from the active item', async () => {
  const utils = await import('./hero-shelf-utils').catch(() => ({ getShelfOffset: undefined }));
  assert.equal(typeof utils.getShelfOffset, 'function');
  if (!utils.getShelfOffset) return;

  assert.equal(utils.getShelfOffset(0, 0, 6), 0);
  assert.equal(utils.getShelfOffset(1, 0, 6), 1);
  assert.equal(utils.getShelfOffset(5, 0, 6), -1);
  assert.equal(utils.getShelfOffset(0, 5, 6), 1);
  assert.equal(utils.getShelfOffset(4, 1, 6), 3);
});
