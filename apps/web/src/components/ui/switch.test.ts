import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Switch } from './switch';

test('keeps the switch hit area at least 44px high', () => {
  const html = renderToStaticMarkup(createElement(Switch, { checked: false, onCheckedChange: () => undefined, label: 'فقط موجود' }));
  assert.match(html, /h-11/);
});
