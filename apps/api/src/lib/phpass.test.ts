import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyWpPassword } from './phpass';

// Vectors from the phpass test suite (Openwall).
const HASH_test12345 = '$P$9IQRaTwmfeRo7ud9Fh4E2PdI0S3r.L0';

test('verifyWpPassword accepts a known phpass hash', () => {
  assert.equal(verifyWpPassword('test12345', HASH_test12345), true);
});

test('verifyWpPassword rejects a wrong password', () => {
  assert.equal(verifyWpPassword('wrong-password', HASH_test12345), false);
});

test('verifyWpPassword handles malformed hashes safely', () => {
  assert.equal(verifyWpPassword('anything', ''), false);
  assert.equal(verifyWpPassword('anything', 'not-a-hash'), false);
  assert.equal(verifyWpPassword('anything', '$P$3short'), false);
});
