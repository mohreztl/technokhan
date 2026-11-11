import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from './footer';

test('keeps footer navigation links at least 44px high', () => {
  const html = renderToStaticMarkup(createElement(Footer));
  const targets = html.match(/min-h-11/g) ?? [];
  assert.ok(targets.length >= 8, `expected at least 8 large link targets, got ${targets.length}`);
});
