// Shared TypeScript types

export interface User {
  id: string;
  phoneNumber: string;
  phone?: string; // alias for phoneNumber
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
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
  reviews?: ProductReview[];
  specifications?: ProductSpecification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export enum ProductCategory {
  DETAILING = 'detailing',
  CAR_WRAP = 'car_wrap',
  ACCESSORIES = 'accessories',
  TOOLS = 'tools',
}

export interface Service {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  duration: number; // in minutes
  type: ServiceType;
  images: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  date: Date;
  timeSlot: string;
  location: string;
  carModel: string;
  carYear: number;
  carColor: string;
  notes?: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
