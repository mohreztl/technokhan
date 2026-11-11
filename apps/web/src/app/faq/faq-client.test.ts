import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaqClient } from './client';

test('renders the FAQ count with Persian digits', () => {
  const html = renderToStaticMarkup(createElement(FaqClient));
  assert.match(html, /۸ پاسخ/);
  assert.doesNotMatch(html, />8</);
});
