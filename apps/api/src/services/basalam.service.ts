import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';

/**
 * Basalam (باسلام) marketplace seller API.
 *
 * Token from: basalam.com → پنل فروشنده → تنظیمات → API. The token and the
 * base URL can also be copied from the WordPress Basalam plugin settings in
 * the old panel — keep both projects' values in env only.
 *
 * Basalam's public API shape:
 *   GET {base}/v2/users/me                     — token check
 *   GET {base}/v2/orders?filter[createdAt]...  — seller orders
 * The product-listing endpoints vary by seller program version; the order
 * import below is the stable part both projects need on day one.
 */

export interface BasalamOrder {
  id: string;
  customerPhone: string;
  totalPrice: number;
  items: Array<{ sku: string | null; quantity: number; price: number }>;
  createdAt: string;
}

export class BasalamClient {
  private http: AxiosInstance;
  private baseUrl: string;

  constructor() {
    if (!config.basalam.token) throw new Error('Basalam is not configured (BASALAM_TOKEN)');
    this.baseUrl = (process.env.BASALAM_API_URL || 'https://api.basalam.com').replace(/\/$/, '');
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: config.basalam.timeoutMs,
      headers: { Authorization: `Bearer ${config.basalam.token}` },
    });
  }

  async getVendorProfile(): Promise<{ id: string; name: string }> {
    const response = await this.http.get('/v2/users/me');
    const me = response.data?.data ?? response.data;
    return { id: String(me?.id ?? ''), name: String(me?.name ?? me?.title ?? '') };
  }

  /** Orders created since `since` (ISO date). */
  async fetchOrders(since: string): Promise<BasalamOrder[]> {
    const response = await this.http.get('/v2/orders', {
      params: { 'filter[createdAt][gt]': since, limit: 100 },
    });
    const raw: unknown[] = response.data?.data ?? response.data ?? [];
    if (!Array.isArray(raw)) return [];

    return raw
      .map((entry): BasalamOrder | null => {
        if (!entry || typeof entry !== 'object') return null;
        const e = entry as Record<string, unknown>;
        const id = String(e.id ?? '');
        if (!id) return null;
        const itemsRaw = Array.isArray(e.items) ? e.items : [];
        return {
          id,
          customerPhone: String(e.customerPhone ?? e.phone ?? ''),
          totalPrice: Number(e.totalPrice ?? e.price ?? 0),
          createdAt: String(e.createdAt ?? ''),
          items: itemsRaw
            .map((it) => {
              const item = (it ?? {}) as Record<string, unknown>;
              return {
                sku: item.sku != null ? String(item.sku) : null,
                quantity: Number(item.quantity ?? 1),
                price: Number(item.price ?? 0),
              };
            })
            .filter((it) => it.quantity > 0),
        };
      })
      .filter((order): order is BasalamOrder => order !== null);
  }

  /** Ping the API so cron failures surface in logs early. */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getVendorProfile();
      return true;
    } catch (error) {
      logger.warn({ err: error }, 'Basalam health check failed');
      return false;
    }
  }
}
