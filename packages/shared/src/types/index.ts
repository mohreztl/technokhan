// Shared TypeScript types for AutoLounge (web + api + seed)
// All money values are in Toman (IRT).

/** ISO string from the API / JSON, Date object in-process */
export type DateLike = string | Date;

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  phoneNumber: string;
  /** alias for phoneNumber (legacy) */
  phone?: string;
  /** Username + password login (from the WordPress migration) */
  username?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAt: DateLike;
  updatedAt: DateLike;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export enum ProductCategory {
  CHARGERS = 'chargers',
  HEADPHONES = 'headphones',
  POWERBANKS = 'powerbanks',
  GAMING = 'gaming',
  WEARABLES = 'wearables',
  CABLES = 'cables',
}

export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  nameFa: string;
  country: string;
}

/** Category as exposed by the data-driven taxonomy endpoints (slug-addressed). */
export interface StoreCategoryInfo {
  slug: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
}

/** Brand as exposed by the data-driven taxonomy endpoints. */
export interface StoreBrandInfo {
  id: string;
  name: string;
  nameFa: string;
  country: string;
  productCount: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image?: string;
}

export interface WarrantyOption {
  id: string;
  title: string;
  months: number;
  priceDelta: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: DateLike;
  helpfulCount?: number;
}

/** @deprecated use Review */
export type ProductReview = Review;

export interface Product {
  /** Stable URL slug shared by the catalog, API and storefront. */
  id: string;
  /** WooCommerce/WordPress slug preserved from migration (SEO); fallback is `id` */
  slug?: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  featured: boolean;
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  specifications?: ProductSpecification[];
  features?: string[];
  tags?: string[];
  colors?: ProductColor[];
  warranties?: WarrantyOption[];
  salesCount?: number;
  editorChoice?: boolean;
  dealEndsAt?: string;
  isActive?: boolean;
  createdAt: DateLike;
  updatedAt: DateLike;
}

// ---------------------------------------------------------------------------
// Orders & payments
// ---------------------------------------------------------------------------

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export type PaymentMethod = 'zarinpal' | 'cod';

export interface Address {
  id?: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface OrderItemSelection {
  colorName?: string;
  warrantyId?: string;
  warrantyTitle?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  selection?: OrderItemSelection;
  /** populated by the API on reads */
  product?: Pick<Product, 'id' | 'name' | 'nameEn' | 'images' | 'brand'>;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal?: number;
  discount: number;
  shippingCost: number;
  totalPrice: number;
  shippingAddress: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  /** The shop's own code (OR-XXXXXX), shown to the customer and used by /track */
  trackingCode?: string;
  /** The courier's consignment number, set by an admin when the order ships */
  shipmentCode?: string;
  notes?: string;
  transactions?: PaymentTransaction[];
  createdAt: DateLike;
  updatedAt: DateLike;
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number; unitPrice?: number; selection?: OrderItemSelection }[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  amount: number;
  authority?: string;
  refId?: string;
  status: string;
  gateway: string;
  cardNumber?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: DateLike;
}

export interface PaymentRequestResult {
  authority: string;
  paymentUrl: string;
  amount: number;
  /** true when no merchant id is configured and the gateway is simulated */
  demo?: boolean;
}

export interface PaymentVerifyResult {
  success: boolean;
  refId?: string;
  cardNumber?: string;
  amount?: number;
  orderId?: string;
  message?: string;
}

/**
 * What a guest gets back from /track. Deliberately thin: a tracking code is a
 * weak secret, so this carries no address, no full name and no phone number.
 */
export interface TrackResult {
  kind: 'order';
  code: string;
  status: string;
  createdAt: DateLike;
  updatedAt: DateLike;
  totalPrice: number;
  paymentStatus?: string;
  itemCount?: number;
  shipmentCode?: string;
  /** Province and city of the delivery address — never the street */
  destination?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
  minTotal?: number;
  maxDiscount?: number;
  expiresAt?: DateLike;
  /** Admins can suspend a code without deleting it; absent means active. */
  isActive?: boolean;
  /** Total redemptions allowed across all customers; absent means unlimited. */
  usageLimit?: number;
  usedCount?: number;
  createdAt?: DateLike;
  updatedAt?: DateLike;
}

/**
 * What the shop can change without a deploy. Mirrors the SiteSettings row;
 * the bundled CONTACT / CLOSED_WEEKDAYS / BOOKING_TIME_SLOTS constants are the
 * defaults it starts from.
 */
export interface SiteSettings {
  phone: string;
  mobile: string;
  email: string;
  address: string;
  workingHours: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  /** Footer trust-license embed snippets (enamad / samandehi / اصناف); empty = hidden */
  enamadHtml?: string;
  samandehiHtml?: string;
  asnafHtml?: string;
  updatedAt?: DateLike;
}

/**
 * Just enough of a coupon to re-price a cart: the terms a customer holding the
 * code already knows. Deliberately excludes `usageLimit` / `usedCount`, which
 * `validate-coupon` answers publicly and nobody outside the admin panel needs.
 */
export type CouponTerms = Pick<
  Coupon,
  'code' | 'type' | 'value' | 'description' | 'minTotal' | 'maxDiscount' | 'expiresAt'
>;

export interface CouponResult {
  valid: boolean;
  code?: string;
  discount: number;
  message: string;
  /**
   * The terms that matched, present only when `valid`. The cart keeps them so
   * it can re-price itself as items change without asking the server again —
   * and so a code an admin created after this build shipped still discounts.
   */
  coupon?: CouponTerms;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPVerification {
  phoneNumber: string;
  code: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Magazine
// ---------------------------------------------------------------------------

/**
 * An article body is structured rather than markdown: the renderer stays typed,
 * nothing needs a parser at runtime, and headings can be collected into a table
 * of contents without re-parsing the text.
 */
export type ArticleBlock =
  | { kind: 'heading'; id: string; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'callout'; tone: 'tip' | 'warning'; title: string; text: string }
  | { kind: 'image'; src: string; alt: string; caption?: string }
  | { kind: 'steps'; items: { title: string; text: string }[] };

export type ArticleCategory = 'نگهداری' | 'راهنمای خرید' | 'دانش فنی' | 'پشت صحنه';

export interface Article {
  /** URL slug; also the id. */
  slug: string;
  title: string;
  /** One or two sentences; used on cards, meta description and OG. */
  excerpt: string;
  category: ArticleCategory;
  cover: string;
  /** ISO date the piece was published. */
  publishedAt: string;
  updatedAt?: string;
  author: { name: string; role: string; avatar?: string };
  /** Minutes to read, rounded. */
  readingMinutes: number;
  tags: string[];
  /** Shown on the homepage magazine rail. */
  featured?: boolean;
  /** Products the piece is about, linked at the end. */
  relatedProductIds?: string[];
  body: ArticleBlock[];
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: 'privacy' | 'terms';
  title: string;
  description: string;
  updatedAt: string; // Jalali display string
  sections: LegalSection[];
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: DateLike;
}

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}

// ---------------------------------------------------------------------------
// API envelope
// ---------------------------------------------------------------------------

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PagedList<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  pagination?: Pagination;
}

export interface ProductListQuery {
  category?: string;
  /** Several raw category names at once (a taxonomy page spans its match list). */
  categories?: string[];
  brand?: string;
  brands?: string[];
  features?: string[];
  featured?: boolean;
  /** Only products whose current price is genuinely below the list price. */
  deals?: boolean;
  minDiscount?: number;
  minReviews?: number;
  editorChoice?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'newest' | 'popular' | 'price' | 'rating' | 'name' | 'discount';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminDashboardStats {
  users: number;
  orders: number;
  products: number;
  revenue: number;
  pendingOrders: number;
  unreadMessages: number;
  recentOrders: Order[];
}

/** Magazine article row as managed from the admin panel (Prisma `Article`). */
export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  coverImage: string | null;
  tags: string[];
  author: string | null;
  publishedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Article list item without the heavy HTML body. */
export type AdminArticleSummary = Omit<AdminArticle, 'content'>;
