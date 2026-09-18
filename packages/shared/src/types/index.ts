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
  DETAILING = 'detailing',
  CAR_WRAP = 'car_wrap',
  ACCESSORIES = 'accessories',
  TOOLS = 'tools',
}

export interface ProductSpecification {
  label: string;
  value: string;
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
  /** stable slug id, e.g. "carnauba-wax" */
  id: string;
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
  isActive?: boolean;
  createdAt: DateLike;
  updatedAt: DateLike;
}

export enum ServiceType {
  PAINT_RESTORATION = 'paint_restoration',
  DETAILING = 'detailing',
  CAR_WRAP = 'car_wrap',
  CERAMIC_COATING = 'ceramic_coating',
  PPF = 'ppf', // Paint Protection Film
  INTERIOR_CLEANING = 'interior_cleaning',
  ENGINE_CLEANING = 'engine_cleaning',
  HEADLIGHT_RESTORATION = 'headlight_restoration',
  CUSTOM = 'custom',
}

export type VehicleSize = 'small' | 'medium' | 'large';

export interface ServicePricing {
  small: number;
  medium: number;
  large: number;
}

export interface ServiceAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface ServiceStep {
  title: string;
  description: string;
  /** lucide icon name, resolved by the UI */
  icon?: string;
  durationLabel?: string;
}

export interface BeforeAfterPair {
  before: string;
  after: string;
  caption?: string;
}

export interface Service {
  /** stable slug id, e.g. "ceramic-coating" */
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  shortDescription?: string;
  /** starting ("from") price for a medium vehicle, Toman */
  price: number;
  duration: number; // minutes
  type: ServiceType;
  images: string[];
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  features?: string[];
  steps?: ServiceStep[];
  faq?: FaqItem[];
  pricing?: ServicePricing;
  addons?: ServiceAddon[];
  gallery?: string[];
  beforeAfter?: BeforeAfterPair;
  warrantyMonths?: number;
  tags?: string[];
  isActive?: boolean;
  createdAt: DateLike;
  updatedAt: DateLike;
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type BookingLocation = 'center' | 'onsite';

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  /** populated by the API on reads */
  service?: Pick<Service, 'id' | 'name' | 'nameEn' | 'images' | 'duration' | 'type'>;
  date: DateLike;
  timeSlot: string;
  location: string;
  carModel: string;
  carYear: number;
  carColor: string;
  carPlate?: string;
  vehicleSize?: VehicleSize;
  addonIds?: string[];
  notes?: string;
  status: BookingStatus;
  totalPrice: number;
  trackingCode?: string;
  createdAt: DateLike;
  updatedAt: DateLike;
}

export interface CreateBookingInput {
  serviceId: string;
  date: string; // yyyy-MM-dd (Gregorian)
  timeSlot: string;
  location: string;
  carModel: string;
  carYear: number;
  carColor: string;
  carPlate?: string;
  vehicleSize?: VehicleSize;
  addonIds?: string[];
  notes?: string;
  totalPrice: number;
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

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
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
  items: { productId: string; quantity: number }[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  bookingId?: string;
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
  bookingId?: string;
  message?: string;
}

/**
 * What a guest gets back from /track. Deliberately thin: a tracking code is a
 * weak secret, so this carries no address, no full name and no phone number.
 */
export interface TrackResult {
  kind: 'order' | 'booking';
  code: string;
  status: string;
  createdAt: DateLike;
  updatedAt: DateLike;
  totalPrice: number;
  /** Orders only */
  paymentStatus?: string;
  itemCount?: number;
  shipmentCode?: string;
  /** Province and city of the delivery address — never the street */
  destination?: string;
  /** Bookings only */
  serviceName?: string;
  date?: DateLike;
  timeSlot?: string;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
  minTotal?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

export interface CouponResult {
  valid: boolean;
  code?: string;
  discount: number;
  message: string;
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

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  rating: number;
  text: string;
  serviceId?: string;
  serviceName?: string;
  carModel?: string;
  date: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  experienceYears?: number;
  specialties?: string[];
  socials?: { instagram?: string; linkedin?: string };
}

export interface Certification {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  description: string;
  year?: number;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
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

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  serviceType: ServiceType;
  serviceId?: string;
  before: string;
  after: string;
  cover?: string;
  tags: string[];
  vehicle?: string;
  date?: string;
}

export type WrapFinish = 'gloss' | 'satin' | 'matte' | 'chrome';

export interface WrapColor {
  id: string;
  name: string;
  nameEn: string;
  hex: string;
  finishes: WrapFinish[];
  popular?: boolean;
  /** price multiplier vs. base wrap price */
  priceFactor?: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate?: string;
  size: VehicleSize;
}

export interface VehicleCatalogEntry {
  brand: string;
  brandEn: string;
  models: { name: string; size: VehicleSize }[];
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
// Quotes
// ---------------------------------------------------------------------------

export interface QuoteInput {
  serviceId: string;
  size: VehicleSize;
  addonIds: string[];
}

export interface QuoteResult {
  base: number;
  addons: { id: string; name: string; price: number }[];
  total: number;
  durationMinutes: number;
  currency: 'IRT';
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
  brand?: string;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceListQuery {
  type?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminDashboardStats {
  users: number;
  orders: number;
  bookings: number;
  products: number;
  services: number;
  revenue: number;
  pendingOrders: number;
  pendingBookings: number;
  unreadMessages: number;
  recentOrders: Order[];
  recentBookings: Booking[];
}
