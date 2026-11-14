import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSupportReply } from './support-replies';

test('routes order and returns questions to the right self-service flow', () => {
  assert.equal(getSupportReply('سفارش من کجاست؟').href, '/track');
  assert.equal(getSupportReply('شرایط مرجوع کردن کالا چیست؟').href, '/contact?subject=بازگشت کالا');
});

test('returns real in-stock category recommendations', () => {
  const reply = getSupportReply('یک شارژر خوب می‌خواهم');
  assert.equal(reply.href, '/category/chargers');
  assert.match(reply.text, /تومان/);
});
