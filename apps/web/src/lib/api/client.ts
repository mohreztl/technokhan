import { API_BASE_URL } from '@autolounge/shared';
import type {
  Product,
  Service,
  Booking,
  Order,
  User,
  ApiResponse,
  OTPRequest,
  OTPVerification,
  AuthResponse,
} from '@autolounge/shared';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'خطا در برقراری ارتباط با سرور',
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'خطا در برقراری ارتباط با سرور',
      };
    }
  }

  // Auth APIs
  async sendOTP(data: OTPRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: OTPVerification): Promise<ApiResponse<AuthResponse>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Products APIs
  async getProducts(params?: {
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ products: Product[]; total: number; pages: number }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request(`/products?${searchParams.toString()}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.request('/products?featured=true&limit=8');
  }

  // Services APIs
  async getServices(params?: {
    type?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ services: Service[]; total: number; pages: number }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request(`/services?${searchParams.toString()}`);
  }

  async getService(id: string): Promise<ApiResponse<Service>> {
    return this.request(`/services/${id}`);
  }

  async getFeaturedServices(): Promise<ApiResponse<Service[]>> {
    return this.request('/services?featured=true&limit=6');
  }

  // Booking APIs
  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Booking>> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(): Promise<ApiResponse<Booking[]>> {
    return this.request('/bookings');
  }

  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.request(`/bookings/${id}`);
  }

  async cancelBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  async getAvailableSlots(date: string, serviceId: string): Promise<ApiResponse<string[]>> {
    return this.request(`/bookings/available-slots?date=${date}&serviceId=${serviceId}`);
  }

  // Orders APIs
  async createOrder(data: {
    items: { productId: string; quantity: number }[];
    shippingAddress: {
      fullName: string;
      phoneNumber: string;
      province: string;
      city: string;
      postalCode: string;
      addressLine: string;
    };
  }): Promise<ApiResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request('/orders');
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}`);
  }

  // Contact Form
  async submitContactForm(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
