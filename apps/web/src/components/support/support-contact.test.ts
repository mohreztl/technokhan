import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSupportContactLinks } from './support-contact';

const settings = { phone: '', mobile: '', whatsapp: '' };

test('creates telephone, Bale and WhatsApp links from valid settings', () => {
  const links = getSupportContactLinks({
    phone: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
    mobile: '',
    whatsapp: 'https://wa.me/989123456789',
  });
  assert.deepEqual(links, [
    { id: 'phone', label: 'تماس تلفنی', href: 'tel:09123456789' },
    { id: 'bale', label: 'پیام در بله', href: 'https://ble.ir/technokhan' },
    { id: 'whatsapp', label: 'پیام در واتس‌اپ', href: 'https://wa.me/989123456789' },
  ]);
});

test('omits unavailable phone and malformed WhatsApp links', () => {
  assert.deepEqual(getSupportContactLinks(settings).map((link) => link.id), ['bale']);
  assert.deepEqual(getSupportContactLinks({ ...settings, whatsapp: 'https://wa.me/technokhan' }).map((link) => link.id), ['bale']);
});

test('prefers a valid mobile number over the landline', () => {
  const links = getSupportContactLinks({ ...settings, phone: '02112345678', mobile: '+989121234567' });
  assert.equal(links[0]?.href, 'tel:+989121234567');
});
