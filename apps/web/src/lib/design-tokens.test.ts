import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TECHNO_TOKENS } from './design-tokens';

describe('TechnoKhan design tokens', () => {
  it('pins the industrial graphite and accessible volt palette', () => {
    assert.equal(TECHNO_TOKENS.colors.dark.background, '#090B0C');
    assert.equal(TECHNO_TOKENS.colors.light.background, '#F2F3EF');
    assert.equal(TECHNO_TOKENS.colors.dark.accent, '#C8F45A');
    assert.equal(TECHNO_TOKENS.colors.light.accent, '#709800');
    assert.equal(TECHNO_TOKENS.colors.light.deal, '#FF6846');
  });

  it('uses Vazirmatn with tabular numerals and deliberate radii', () => {
    assert.equal(TECHNO_TOKENS.typography.family, 'Vazirmatn');
    assert.equal(TECHNO_TOKENS.typography.numericVariant, 'tabular-nums');
    assert.deepEqual(TECHNO_TOKENS.radii, { control: 12, card: 20, showcase: 28 });
  });
});
