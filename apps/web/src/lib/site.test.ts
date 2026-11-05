import assert from 'node:assert/strict';
import { test } from 'node:test';
import { siteUrl } from './site';

test('defaults the canonical origin to TechnoKhan', () => {
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const serverSiteUrl = process.env.SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.SITE_URL;

  try {
    assert.equal(siteUrl(), 'https://technokhan.com');
  } finally {
    if (publicSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = publicSiteUrl;
    if (serverSiteUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = serverSiteUrl;
  }
});
