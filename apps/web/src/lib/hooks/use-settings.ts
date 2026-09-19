'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_SITE_SETTINGS } from '@autolounge/shared';
import type { SiteSettings } from '@autolounge/shared';
import { settingsApi } from '@/lib/api/endpoints';
import { unwrap } from '@/lib/api/client';
import { qk } from '@/lib/api/query-keys';

/**
 * The shop's own settings — opening days, bookable windows, contact details.
 *
 * Renders from the bundled defaults first so the server HTML carries real phone
 * numbers and an address (and stays right with JS off), then swaps in whatever
 * the shop has saved. `placeholderData` rather than `initialData` so the query
 * still counts as stale and fetches on mount.
 */
export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: qk.settings(),
    queryFn: () => unwrap(settingsApi.get()),
    placeholderData: DEFAULT_SITE_SETTINGS,
    staleTime: 5 * 60_000,
  });
}

/** Just the settings, never undefined — for components that only render values. */
export function useSettings(): SiteSettings {
  return useSiteSettings().data ?? DEFAULT_SITE_SETTINGS;
}
