import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ALL_MEDIA } from './media-assets';

describe('TechnoKhan AI media manifest', () => {
  it('registers exactly 30 unique local WebP assets', () => {
    assert.equal(ALL_MEDIA.length, 30);
    assert.equal(new Set(ALL_MEDIA.map((asset) => asset.src)).size, 30);
    for (const asset of ALL_MEDIA) {
      assert.match(asset.src, /^\/images\/.+\.webp$/);
      assert.ok(asset.width >= 1000 && asset.height >= 768);
    }
  });

  it('provides descriptive Persian alt text and real files for every asset', () => {
    for (const asset of ALL_MEDIA) {
      assert.ok(asset.alt.length >= 20, `Missing alt for ${asset.src}`);
      assert.match(asset.alt, /[آ-ی]/);
      assert.ok(fs.existsSync(path.join(process.cwd(), 'public', asset.src)), `Missing ${asset.src}`);
    }
  });

  it('contains no duplicate image payloads', () => {
    const hashes = ALL_MEDIA.map((asset) => crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'public', asset.src))).digest('hex'));
    assert.equal(new Set(hashes).size, ALL_MEDIA.length);
  });
});
