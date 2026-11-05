import assert from 'node:assert/strict';
import { test } from 'node:test';

test('replaces a failed product image with the local placeholder', async () => {
  const { handleImageError } = await import('./image-fallback').catch(() => ({ handleImageError: undefined }));
  assert.equal(typeof handleImageError, 'function');
  if (!handleImageError) return;

  const image = { src: '/images/products/missing.webp', onerror: () => true };
  handleImageError({ currentTarget: image } as unknown as Parameters<typeof handleImageError>[0]);
  assert.equal(image.src, '/images/placeholder-product.webp');
  assert.equal(image.onerror, null);
});
