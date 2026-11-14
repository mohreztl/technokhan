import axios, { AxiosInstance } from 'axios';
import https from 'node:https';
import { config } from '../../config';

/**
 * Sepidar accounting (همکاران سیستم) REST client.
 *
 * Sepidar's web service is served by the customer's own Sepidar installation,
 * so the base URL and endpoint paths come from the WordPress panel's Sepidar
 * plugin settings (RETL / "سپیدار" sync plugin) and are env-configurable here.
 * The defaults follow the common Sepidar API layout; override any of them if
 * the panel shows different paths.
 *
 * Auth: HTTP Basic with the Sepidar web-service username/password.
 */

export interface SepidarItem {
  /** Item code — the one-to-one key mapped to Product.sku */
  code: string;
  name: string;
  sellPrice: number;
  barcode?: string;
  unit?: string;
  group?: string;
  /** Available stock across warehouses, when the endpoint returns it */
  stock?: number;
}

export interface SepidarClientOptions {
  baseUrl?: string;
  username?: string;
  password?: string;
  /** Endpoint paths (with leading slash), overridable per installation */
  itemsPath?: string;
  stockPath?: string;
  timeoutMs?: number;
}

function firstDefined(...values: Array<string | number | undefined | null>): string | number | undefined {
  return values.find((v) => v !== undefined && v !== null && v !== '') ?? undefined;
}

/** Extract a number from Sepidar's various numeric shapes ("1,234"/"1234.0"). */
function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(/[,٬]/g, ''));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export class SepidarClient {
  private http: AxiosInstance;
  private itemsPath: string;
  private stockPath: string;

  constructor(options: SepidarClientOptions = {}) {
    const baseUrl = options.baseUrl ?? config.sepidar.baseUrl;
    const username = options.username ?? config.sepidar.username;
    const password = options.password ?? config.sepidar.password;
    if (!baseUrl || !username || !password) {
      throw new Error('Sepidar is not configured (SEPIDAR_BASE_URL/USERNAME/PASSWORD)');
    }
    this.itemsPath = options.itemsPath ?? process.env.SEPIDAR_ITEMS_PATH ?? '/api/Item/GetItems';
    this.stockPath = options.stockPath ?? process.env.SEPIDAR_STOCK_PATH ?? '/api/Stock/GetStocks';
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: options.timeoutMs ?? config.sepidar.timeoutMs,
      auth: { username, password },
      headers: { 'Content-Type': 'application/json' },
      // Sepidar installs commonly use self-signed LAN certificates.
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
  }

  /** The price-list filter configured for this shop, sent when the API supports it. */
  private priceListParam(): Record<string, unknown> {
    return config.sepidar.priceListId > 0 ? { priceListId: config.sepidar.priceListId } : {};
  }

  /** All sellable items with their current sell price. */
  async fetchItems(): Promise<SepidarItem[]> {
    const response = await this.http.get(this.itemsPath, { params: this.priceListParam() });
    const raw: unknown = response.data;
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { Data?: unknown[] })?.Data)
        ? (raw as { Data: unknown[] }).Data
        : [];

    return list
      .map((entry): SepidarItem | null => {
        if (!entry || typeof entry !== 'object') return null;
        const e = entry as Record<string, unknown>;
        const code = firstDefined(
          e.Code as string, e.ItemCode as string, e.code as string,
          e.Id as number, e.ID as number, e.ItemID as number
        );
        const name = firstDefined(e.Name as string, e.Title as string, e.name as string);
        const sellPrice = toNumber(
          firstDefined(
            e.SellPrice as string, e.Price as number, e.SalesPrice as number,
            e.Fee as number, e.sellPrice as number
          )
        );
        if (code === undefined || name === undefined || sellPrice === undefined) return null;
        return {
          code: String(code),
          name: String(name),
          sellPrice,
          barcode: firstDefined(e.Barcode as string, e.BarCode as string) as string | undefined,
          unit: firstDefined(e.Unit as string, e.UnitName as string) as string | undefined,
          group: firstDefined(e.GroupName as string, e.Category as string) as string | undefined,
          stock: toNumber(firstDefined(e.Stock as number, e.Available as number, e.Inventory as number)),
        };
      })
      .filter((item): item is SepidarItem => item !== null);
  }

  /**
   * Stock per item code. Sepidar returns stock rows per warehouse; we sum them.
   * Returns an empty map when the endpoint is unavailable — price sync still runs.
   */
  async fetchStocks(): Promise<Map<string, number>> {
    const stocks = new Map<string, number>();
    try {
      const response = await this.http.get(this.stockPath);
      const raw: unknown = response.data;
      const list: unknown[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { Data?: unknown[] })?.Data)
          ? (raw as { Data: unknown[] }).Data
          : [];
      for (const entry of list) {
        if (!entry || typeof entry !== 'object') continue;
        const e = entry as Record<string, unknown>;
        const code = firstDefined(e.ItemCode as string, e.Code as string, e.code as string);
        const qty = toNumber(firstDefined(e.Quantity as number, e.Qty as number, e.Stock as number));
        if (code === undefined || qty === undefined) continue;
        const key = String(code);
        stocks.set(key, (stocks.get(key) ?? 0) + qty);
      }
    } catch {
      // Stock endpoint is optional; absence must not block the price sync.
    }
    return stocks;
  }
}
