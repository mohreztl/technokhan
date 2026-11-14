// Shared helpers for the WordPress migration tools.
//
// All tools read one env set per project (see docs/wordpress-migration.md §۲):
//   WP_URL, WP_USER, WP_APP_PASSWORD            — WordPress REST (Application Passwords)
//   WC_CONSUMER_KEY, WC_CONSUMER_SECRET          — WooCommerce REST
//   MIGRATION_EXPORT_DIR                         — where export JSON files land
// The credentials are the same ones stored in the old panel's plugins.
import '../src/config'; // loads .env first
import fs from 'node:fs';
import path from 'node:path';
import axios, { AxiosInstance } from 'axios';

export const WP_URL = (process.env.WP_URL || '').replace(/\/$/, '');
export const EXPORT_DIR = process.env.MIGRATION_EXPORT_DIR || './data/exports';

export function requireWp(): void {
  if (!WP_URL) throw new Error('WP_URL is not set');
}

export function wpClient(): AxiosInstance {
  const user = process.env.WP_USER;
  const password = process.env.WP_APP_PASSWORD;
  if (!user || !password) throw new Error('WP_USER / WP_APP_PASSWORD are not set');
  return axios.create({
    baseURL: `${WP_URL}/wp-json`,
    auth: { username: user, password },
    timeout: 30_000,
  });
}

export function wcClient(): AxiosInstance {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('WC_CONSUMER_KEY / WC_CONSUMER_SECRET are not set');
  return axios.create({
    baseURL: `${WP_URL}/wp-json/wc/v3`,
    auth: { username: key, password: secret },
    timeout: 30_000,
  });
}

/** Page through a WP/REST endpoint until it runs dry. */
export async function fetchAllPages<T>(client: AxiosInstance, url: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  for (;;) {
    const response = await client.get<T[]>(url, { params: { ...params, per_page: 100, page } });
    const batch = Array.isArray(response.data) ? response.data : [];
    items.push(...batch);
    const totalPages = Number(response.headers['x-wp-totalpages'] || 1);
    if (batch.length === 0 || page >= totalPages) return items;
    page++;
  }
}

export function ensureExportDir(): void {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

export function saveExport<T>(name: string, data: T[]): string {
  ensureExportDir();
  const file = path.join(EXPORT_DIR, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`${name}: ${data.length} rows → ${file}`);
  return file;
}

export function readExport<T>(name: string): T[] {
  const file = path.join(EXPORT_DIR, name);
  if (!fs.existsSync(file)) throw new Error(`export file not found: ${file} — run migrate:export-wp first`);
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T[];
}
