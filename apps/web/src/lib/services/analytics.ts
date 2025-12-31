/**
 * Google Analytics 4 Integration
 * 
 * This module provides GA4 tracking functionality including:
 * - Page views
 * - Custom events
 * - E-commerce tracking
 * - User properties
 */

// GA4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Check if GA is available
const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Initialize GA4
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID) return;

  // Add gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    cookie_flags: 'SameSite=None;Secure',
  });
};

// Track page view
export const pageView = (url: string, title?: string): void => {
  if (!isGAAvailable()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
  });
};

// Track custom event
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// E-commerce Events
export const ecommerce = {
  // View product
  viewItem: (product: {
    id: string;
    name: string;
    category?: string;
    brand?: string;
    price: number;
  }): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'view_item', {
      currency: 'IRR',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand,
          price: product.price,
        },
      ],
    });
  },

  // Add to cart
  addToCart: (product: {
    id: string;
    name: string;
    category?: string;
    brand?: string;
    price: number;
    quantity: number;
  }): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'add_to_cart', {
      currency: 'IRR',
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    });
  },

  // Remove from cart
  removeFromCart: (product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'remove_from_cart', {
      currency: 'IRR',
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    });
  },

  // View cart
  viewCart: (
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>,
    total: number
  ): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'view_cart', {
      currency: 'IRR',
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  },

  // Begin checkout
  beginCheckout: (
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>,
    total: number
  ): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'begin_checkout', {
      currency: 'IRR',
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  },

  // Purchase complete
  purchase: (
    transactionId: string,
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>,
    total: number,
    shipping?: number,
    tax?: number
  ): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'IRR',
      value: total,
      shipping: shipping || 0,
      tax: tax || 0,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  },

  // Refund
  refund: (transactionId: string, value?: number): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'refund', {
      transaction_id: transactionId,
      value: value,
    });
  },
};

// User Events
export const userEvents = {
  // User login
  login: (method: string): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'login', {
      method: method,
    });
  },

  // User sign up
  signUp: (method: string): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'sign_up', {
      method: method,
    });
  },

  // Search
  search: (searchTerm: string): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  },

  // Share
  share: (contentType: string, itemId: string, method: string): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'share', {
      content_type: contentType,
      item_id: itemId,
      method: method,
    });
  },
};

// Service-specific events
export const serviceEvents = {
  // View service
  viewService: (service: {
    id: string;
    name: string;
    category: string;
    price: number;
  }): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'view_service', {
      service_id: service.id,
      service_name: service.name,
      service_category: service.category,
      value: service.price,
    });
  },

  // Book service
  bookService: (service: {
    id: string;
    name: string;
    category: string;
    price: number;
    date: string;
  }): void => {
    if (!isGAAvailable()) return;

    window.gtag('event', 'book_service', {
      service_id: service.id,
      service_name: service.name,
      service_category: service.category,
      booking_date: service.date,
      value: service.price,
    });
  },
};

// Types for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
