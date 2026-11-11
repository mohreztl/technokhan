import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as productQuery from './product-query';

test('normalizes Persian and Arabic search text consistently', () => {
  assert.equal(typeof productQuery.normalizeSearchText, 'function');
  if (!productQuery.normalizeSearchText) return;
  assert.equal(productQuery.normalizeSearchText('  كبود  شارژر '), 'کبود شارژر');
});
