import { DEFAULT_SITE_SETTINGS } from '@technokhan/shared';
import type { SiteSettings } from '@technokhan/shared';

import { prisma } from './prisma';

/**
 * The shop's own settings — opening days, one-off closures, bookable windows
 * and contact details. A single row, `id = "default"`, seeded from the bundled
 * constants so a fresh database behaves exactly as the hard-coded values did.
 */
export const DEFAULT_SETTINGS: SiteSettings = DEFAULT_SITE_SETTINGS;

/**
 * Availability is checked on nearly every booking request, so the row is held
 * briefly in memory. Short enough that an admin's change shows up while they
 * are still looking at the page.
 */
const CACHE_MS = 30_000;
let cached: { value: SiteSettings; at: number } | null = null;

export function invalidateSettingsCache() {
  cached = null;
}

/**
 * The bundled constants stand in for a database that has no settings row yet —
 * before the seed runs, or against a demo build with no database at all.
 *
 * A row an admin has saved is taken at its word, empty strings included: a shop
 * that deletes its Telegram link means it, and getting the seeded URL back
 * would make the field impossible to clear. The one exception is `timeSlots`,
 * where an empty list would quietly close the booking page.
 */
function withDefaults(row: Partial<SiteSettings> | null): SiteSettings {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    closedWeekdays: row.closedWeekdays ?? DEFAULT_SETTINGS.closedWeekdays,
    closedDates: row.closedDates ?? [],
    timeSlots: row.timeSlots?.length ? row.timeSlots : DEFAULT_SETTINGS.timeSlots,
    phone: row.phone ?? DEFAULT_SETTINGS.phone,
    mobile: row.mobile ?? DEFAULT_SETTINGS.mobile,
    email: row.email ?? DEFAULT_SETTINGS.email,
    address: row.address ?? DEFAULT_SETTINGS.address,
    workingHours: row.workingHours ?? DEFAULT_SETTINGS.workingHours,
    instagram: row.instagram ?? DEFAULT_SETTINGS.instagram,
    telegram: row.telegram ?? DEFAULT_SETTINGS.telegram,
    whatsapp: row.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
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
    closedWeekdays: input.closedWeekdays,
    closedDates: input.closedDates,
    timeSlots: input.timeSlots,
    phone: input.phone,
    mobile: input.mobile,
    email: input.email,
    address: input.address,
    workingHours: input.workingHours,
    instagram: input.instagram,
    telegram: input.telegram,
    whatsapp: input.whatsapp,
  };
  const row = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...data },
    update: data,
  });
  invalidateSettingsCache();
  return withDefaults(row);
}
