import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  STORE_BRANDS,
  STORE_CATEGORIES,
  categoryForRawName,
  detectBrandId,
  findStoreBrand,
  findStoreCategory,
  normalizeTaxonomyText,
} from './taxonomy';

describe('store taxonomy', () => {
  it('has unique slugs and non-empty match lists', () => {
    const slugs = STORE_CATEGORIES.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const category of STORE_CATEGORIES) {
      assert.ok(category.match.length > 0, `${category.slug} needs match values`);
      assert.ok(category.name.trim(), `${category.slug} needs a name`);
    }
  });

  it('normalizes Arabic letter variants', () => {
    assert.equal(normalizeTaxonomyText('ايرپاد'), normalizeTaxonomyText('ایرپاد'));
    assert.equal(normalizeTaxonomyText('کابل  میکرو'), 'کابل میکرو');
  });

  it('resolves raw Sepidar categories with any spelling to their page', () => {
    assert.equal(categoryForRawName('کابل و شارژر')?.slug, 'cables-chargers');
    assert.equal(categoryForRawName('هدفون و هندزفري بلوتوث')?.slug, 'headphones');
    assert.equal(categoryForRawName('ايرپاد')?.slug, 'airpods');
    assert.equal(categoryForRawName('کابل ایوایکس')?.slug, 'aux-cables');
    assert.equal(categoryForRawName('ناشناخته') ?? null, null);
  });

  it('resolves canonical slugs, legacy aliases and raw names as slugs', () => {
    assert.equal(findStoreCategory('headphones')?.slug, 'headphones');
    assert.equal(findStoreCategory('chargers')?.slug, 'cables-chargers');
    assert.equal(findStoreCategory('powerbanks')?.slug, 'powerbank');
    assert.equal(findStoreCategory(encodeURIComponent('کابل و شارژر'))?.slug, 'cables-chargers');
    assert.equal(findStoreCategory('nope') ?? null, null);
  });

  it('detects brands from product names in either language', () => {
    assert.equal(detectBrandId('شارژر فست پکدار10 وات سامسونگ (سریAAA)'), 'samsung');
    assert.equal(detectBrandId('کابل تایپ سی LDNIO مدل LC121'), 'ldnio');
    assert.equal(detectBrandId('هدفون بلوتوثی ايردام Earldom'), 'earldom');
    assert.equal(detectBrandId('cable', 'Mcdodo USB-C 100W'), 'mcdodo');
    assert.equal(detectBrandId('هولدر مگنتی ماشین'), null);
    // "xo" must not match inside unrelated latin words
    assert.equal(detectBrandId('box organizer pro'), null);
    assert.equal(detectBrandId('هندزفری XO مدل BE1'), 'xo');
  });

  it('finds brands by id', () => {
    assert.equal(findStoreBrand('samsung')?.nameFa, 'سامسونگ');
    assert.equal(findStoreBrand('nope') ?? null, null);
    assert.ok(STORE_BRANDS.every((b) => b.aliases.length > 0));
  });
});
