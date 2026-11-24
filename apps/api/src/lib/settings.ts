import { DEFAULT_SITE_SETTINGS } from '@technokhan/shared';
import type { SiteSettings } from '@technokhan/shared';

import { prisma } from './prisma';

export const DEFAULT_SETTINGS: SiteSettings = DEFAULT_SITE_SETTINGS;

const CACHE_MS = 30_000;
let cached: { value: SiteSettings; at: number } | null = null;

export function invalidateSettingsCache() {
  cached = null;
}

function withDefaults(row: Partial<SiteSettings> | null): SiteSettings {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    phone: row.phone ?? DEFAULT_SETTINGS.phone,
    mobile: row.mobile ?? DEFAULT_SETTINGS.mobile,
    email: row.email ?? DEFAULT_SETTINGS.email,
    address: row.address ?? DEFAULT_SETTINGS.address,
    workingHours: row.workingHours ?? DEFAULT_SETTINGS.workingHours,
    instagram: row.instagram ?? DEFAULT_SETTINGS.instagram,
    telegram: row.telegram ?? DEFAULT_SETTINGS.telegram,
    whatsapp: row.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
    enamadHtml: row.enamadHtml ?? '',
    samandehiHtml: row.samandehiHtml ?? '',
    asnafHtml: row.asnafHtml ?? '',
    updatedAt: row.updatedAt,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const row = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  const value = withDefaults(row);
  cached = { value, at: Date.now() };
  return value;
}

export async function saveSettings(input: SiteSettings): Promise<SiteSettings> {
  const data = {
    phone: input.phone,
    mobile: input.mobile,
    email: input.email,
    address: input.address,
    workingHours: input.workingHours,
    instagram: input.instagram,
    telegram: input.telegram,
    whatsapp: input.whatsapp,
    enamadHtml: input.enamadHtml ?? '',
    samandehiHtml: input.samandehiHtml ?? '',
    asnafHtml: input.asnafHtml ?? '',
  };
  const row = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...data },
    update: data,
  });
  invalidateSettingsCache();
  return withDefaults(row);
}
