'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Sparkles, Package, Wrench, Clock, Trash2, TrendingUp, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROUTES, ProductCategory, ServiceType } from '@autolounge/shared';
import type { Product, Service } from '@autolounge/shared';
import { useGlobalSearch, useSearchState } from '@/lib/hooks/use-search';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data - در تولید از API دریافت کنید
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'واکس کارناوبا پریمیوم',
    nameEn: 'Premium Carnauba Wax',
    description: 'واکس طبیعی با درخشش فوق‌العاده',
    descriptionEn: 'Natural wax with exceptional shine',
    price: 2500000,
    discountPrice: 2250000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/wax1.jpg'],
    stock: 15,
    featured: true,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'حوله میکروفایبر دوطرفه',
    nameEn: 'Microfiber Towel',
    description: 'حوله میکروفایبر با کیفیت بالا',
    descriptionEn: 'High-quality microfiber towel',
    price: 450000,
    category: ProductCategory.ACCESSORIES,
    images: ['/images/products/towel.jpg'],
    stock: 50,
    featured: false,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'شامپو خودرو حرفه‌ای',
    nameEn: 'Professional Car Shampoo',
    description: 'شامپوی غلیظ با فوم فراوان',
    descriptionEn: 'Concentrated shampoo with rich foam',
    price: 380000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/shampoo.jpg'],
    stock: 30,
    featured: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'پولیش کامپاوند',
    nameEn: 'Compound Polish',
    description: 'پولیش برای رفع خط و خش',
    descriptionEn: 'Polish for scratch removal',
    price: 1850000,
    category: ProductCategory.DETAILING,
    images: ['/images/products/polish.jpg'],
    stock: 20,
    featured: false,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'دیتیلینگ حرفه‌ای',
    nameEn: 'Professional Detailing',
    description: 'شست‌وشو و پولیش کامل داخل و خارج',
    descriptionEn: 'Complete interior and exterior detailing',
    price: 3500000,
    duration: 240,
    type: ServiceType.DETAILING,
    images: ['/images/services/detailing.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'سرامیک کوتینگ',
    nameEn: 'Ceramic Coating',
    description: 'پوشش سرامیکی با دوام ۳ سال',
    descriptionEn: '3-year ceramic coating protection',
    price: 12000000,
    duration: 480,
    type: ServiceType.CERAMIC_COATING,
    images: ['/images/services/ceramic.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'PPF کاپوت',
    nameEn: 'Hood PPF',
    description: 'محافظ رنگ شفاف برای کاپوت',
    descriptionEn: 'Clear paint protection film for hood',
    price: 8500000,
    duration: 360,
    type: ServiceType.PPF,
    images: ['/images/services/ppf.jpg'],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const POPULAR_SEARCHES = [
  'سرامیک کوتینگ',
  'واکس خودرو',
  'دیتیلینگ',
  'رپینت',
  'PPF',
  'شامپو خودرو',
  'پولیش',
  'میکروفایبر',
];

const QUICK_LINKS = [
  { title: 'خدمات محبوب', href: ROUTES.SERVICES, icon: '🚗' },
  { title: 'محصولات پرفروش', href: ROUTES.PRODUCTS, icon: '🛒' },
  { title: 'رزرو آنلاین', href: ROUTES.BOOKING, icon: '📅' },
  { title: 'تماس با ما', href: ROUTES.CONTACT, icon: '📞' },
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  } = useSearchState();

  const { search } = useGlobalSearch(MOCK_PRODUCTS, MOCK_SERVICES);
  const [results, setResults] = useState<ReturnType<typeof search>>([]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen, setQuery]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchResults = search(query);
      setResults(searchResults);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, setIsSearching]);

  const handleSearchSubmit = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  }, [addRecentSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearchSubmit(query);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[5%] sm:top-[10%] left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-background rounded-2xl shadow-2xl z-50 overflow-hidden border border-border max-h-[85vh] flex flex-col"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="relative flex items-center gap-3">
                {isSearching ? (
                  <Loader2 className="absolute right-4 h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Search className="absolute right-4 h-5 w-5 text-muted-foreground" />
                )}
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="جستجوی محصولات و خدمات..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12 h-14 text-lg bg-muted border-0 focus:ring-2 focus:ring-primary"
                />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {query.trim() ? (
                // Search Results
                <div className="space-y-4">
                  {isSearching ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                      <p className="text-muted-foreground">در حال جستجو...</p>
                    </div>
                  ) : results.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {results.length} نتیجه برای &quot;{query}&quot;
                      </p>
                      <div className="space-y-3">
                        {results.map((result) => (
                          <Link
                            key={`${result.type}-${result.item.id}`}
                            href={
                              result.type === 'product'
                                ? `${ROUTES.PRODUCTS}/${result.item.id}`
                                : `${ROUTES.SERVICES}/${result.item.id}`
                            }
                            onClick={() => {
                              addRecentSearch(query);
                              onClose();
                            }}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.01 }}
                              className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                            >
                              {/* Image */}
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={result.item.images[0] || '/images/placeholder.jpg'}
                                  alt={result.item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {result.type === 'product' ? (
                                      <><Package className="h-3 w-3 ml-1" />محصول</>
                                    ) : (
                                      <><Wrench className="h-3 w-3 ml-1" />خدمات</>
                                    )}
                                  </Badge>
                                  {'rating' in result.item && result.item.rating && (
                                    <span className="flex items-center gap-1 text-xs text-yellow-500">
                                      <Star className="h-3 w-3 fill-current" />
                                      {result.item.rating}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                  {result.item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {result.item.description}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="text-left flex-shrink-0">
                                <p className="font-bold text-primary">
                                  {formatPrice(
                                    'discountPrice' in result.item && result.item.discountPrice
                                      ? result.item.discountPrice
                                      : result.item.price
                                  )}
                                </p>
                              </div>

                              <ArrowLeft className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>

                      {/* View All Results */}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => handleSearchSubmit(query)}
                      >
                        مشاهده همه نتایج
                        <ArrowLeft className="h-4 w-4 mr-2" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        نتیجه‌ای یافت نشد
                      </p>
                      <p className="text-sm text-muted-foreground">
                        برای &quot;{query}&quot; هیچ محصول یا خدمتی پیدا نشد.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Default State - Quick Links & Recent Searches
                <div className="space-y-8">
                  {/* Quick Links */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      دسترسی سریع
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {QUICK_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} onClick={onClose}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors group"
                          >
                            <span className="text-2xl">{link.icon}</span>
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {link.title}
                            </span>
                            <ArrowLeft className="h-4 w-4 mr-auto text-muted-foreground group-hover:text-primary transition-colors" />
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Popular Searches */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      جستجوهای محبوب
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((term) => (
                        <Button
                          key={term}
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            setQuery(term);
                          }}
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          جستجوهای اخیر
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          پاک کردن همه
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                          >
                            <button
                              onClick={() => setQuery(term)}
                              className="flex items-center gap-3 flex-1 text-right"
                            >
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground group-hover:text-primary transition-colors">
                                {term}
                              </span>
                            </button>
                            <button
                              onClick={() => removeRecentSearch(term)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Enter</kbd>
                    جستجو
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Esc</kbd>
                    بستن
                  </span>
                </div>
                <span>جستجوی هوشمند فارسی</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
