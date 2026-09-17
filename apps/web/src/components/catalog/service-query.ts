import { SERVICES, SERVICE_TYPE_LABELS, type ServiceListQuery } from '@autolounge/shared';

export const SERVICE_LIST_LIMIT = 50;

/** Service types that actually exist in the catalogue (keeps the chip row honest). */
export const AVAILABLE_SERVICE_TYPES: string[] = Array.from(new Set(SERVICES.map((s) => s.type)));

export function parseServiceType(raw: string | string[] | null | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw ?? undefined;
  return value && value in SERVICE_TYPE_LABELS ? value : undefined;
}

/** Same object shape on server and client so React Query keys line up. */
export function buildServiceQuery(type?: string): ServiceListQuery {
  const q: ServiceListQuery = { limit: SERVICE_LIST_LIMIT };
  if (type) q.type = type;
  return q;
}
