import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StepPayment } from './step-payment';

test('labels online checkout as a demo without a real transaction', () => {
  const html = renderToStaticMarkup(createElement(StepPayment, {
    method: 'zarinpal',
    onMethodChange: () => undefined,
    notes: '',
    onNotesChange: () => undefined,
    subtotal: 1_000_000,
    couponCode: null,
  }));
  assert.match(html, /نمایشی/);
  assert.match(html, /بدون تراکنش واقعی/);
});
