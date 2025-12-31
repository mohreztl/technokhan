'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ServiceCard } from '@/components/molecules/service-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ServiceType } from '@autolounge/shared';
import type { Service } from '@autolounge/shared';

// Mock data - replace with API call later
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'رپینت و صافکاری کامل',
    nameEn: 'Full Paint Restoration',
    description:
      'بازگرداندن درخشش اصلی رنگ خودرو با تکنیک‌های پیشرفته رپینت و صافکاری توسط متخصصان مجرب',
    descriptionEn: 'Restore original paint shine with advanced techniques',
    price: 15000000,
    duration: 480,
    type: ServiceType.PAINT_RESTORATION,
    images: ['/images/services/paint-restoration.jpg'],
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'دیتیلینگ حرفه‌ای خودرو',
    nameEn: 'Professional Car Detailing',
    description: 'شست‌وشو، واکس و پولیش کامل داخل و خارج خودرو با محصولات برند جهانی',
    descriptionEn: 'Complete interior and exterior detailing',
    price: 3500000,
    duration: 240,
    type: ServiceType.DETAILING,
    images: ['/images/services/detailing.jpg'],
    featured: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'سرامیک کوتینگ پیشرفته',
    nameEn: 'Advanced Ceramic Coating',
    description: 'محافظت حرفه‌ای رنگ خودرو با لایه سرامیک ۹H برای دوام تا ۵ سال',
    descriptionEn: 'Professional paint protection with 9H ceramic layer',
    price: 12000000,
    duration: 360,
    type: ServiceType.CERAMIC_COATING,
    images: ['/images/services/ceramic.jpg'],
    featured: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'رپ کامل بدنه',
    nameEn: 'Full Body Wrap',
    description: 'تغییر کامل رنگ خودرو با فیلم رپ باکیفیت و قابل برگشت',
    descriptionEn: 'Complete color change with high-quality reversible wrap film',
    price: 25000000,
    duration: 720,
    type: ServiceType.CAR_WRAP,
    images: ['/images/services/wrap.jpg'],
    featured: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'پوشش محافظ رنگ (PPF)',
    nameEn: 'Paint Protection Film',
    description: 'نصب فیلم محافظ شفاف برای جلوگیری از خط‌اندازی و سنگ پرانی',
    descriptionEn: 'Transparent protective film installation',
    price: 18000000,
    duration: 540,
    type: ServiceType.PPF,
    images: ['/images/services/ppf.jpg'],
    featured: false,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    name: 'دیتیلینگ داخلی پرمیوم',
    nameEn: 'Premium Interior Detailing',
    description: 'تمیز کاری عمیق فضای داخلی، صندلی‌ها، فرش و سقف خودرو',
    descriptionEn: 'Deep cleaning of interior space, seats, carpets and ceiling',
    price: 2500000,
    duration: 180,
    type: ServiceType.DETAILING,
    images: ['/images/services/interior.jpg'],
    featured: false,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '7',
    name: 'پولیش و اصلاح رنگ',
    nameEn: 'Paint Correction & Polish',
    description: 'برطرف کردن خط‌اندازی‌ها و بازگرداندن شفافیت رنگ',
    descriptionEn: 'Remove scratches and restore paint clarity',
    price: 5500000,
    duration: 300,
    type: ServiceType.PAINT_RESTORATION,
    images: ['/images/services/polish.jpg'],
    featured: false,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-25'),
  },
  {
    id: '8',
    name: 'رپ سقف',
    nameEn: 'Roof Wrap',
    description: 'رپ تخصصی سقف خودرو با رنگ‌های مختلف',
    descriptionEn: 'Specialized roof wrapping in various colors',
    price: 4000000,
    duration: 120,
    type: ServiceType.CAR_WRAP,
    images: ['/images/services/roof-wrap.jpg'],
    featured: false,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

const SERVICE_TYPES = [
  { value: 'all', label: 'همه خدمات', type: null },
  { value: 'paint_restoration', label: 'رپینت و صافکاری', type: ServiceType.PAINT_RESTORATION },
  { value: 'detailing', label: 'دیتیلینگ', type: ServiceType.DETAILING },
  { value: 'ceramic_coating', label: 'سرامیک کوتینگ', type: ServiceType.CERAMIC_COATING },
  { value: 'car_wrap', label: 'رپ کامل', type: ServiceType.CAR_WRAP },
  { value: 'ppf', label: 'پوشش محافظ (PPF)', type: ServiceType.PPF },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'محبوب‌ترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'duration-asc', label: 'سریع‌ترین' },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = MOCK_SERVICES.filter((service) => {
      // Search filter
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = !selectedType || service.type === selectedType;

      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'duration-asc':
          return a.duration - b.duration;
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    return filtered;
  }, [searchQuery, selectedType, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSortBy('featured');
  };

  const activeFiltersCount = (selectedType ? 1 : 0) + (sortBy !== 'featured' ? 1 : 0);

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Badge variant="default" className="mb-4">
            خدمات اتولانژ
          </Badge>
          <h1 className="section-title text-gradient-luxury mb-4">خدمات تخصصی مراقبت از خودرو</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            از رپینت و دیتیلینگ تا سرامیک کوتینگ و رپ کامل، همه خدمات با بالاترین کیفیت
          </p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجوی خدمات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 pl-4 h-12 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 relative"
            >
              <SlidersHorizontal className="h-5 w-5" />
              فیلترها
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -left-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{filteredServices.length} خدمت یافت شد</span>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-secondary hover:text-secondary/80"
                >
                  پاک کردن فیلترها
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-effect border border-primary/10 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:w-80 shrink-0"
              >
                <div className="glass-effect-strong border border-primary/10 rounded-2xl p-6 space-y-6 sticky top-24">
                  {/* Service Types */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">نوع خدمات</h3>
                    <div className="space-y-2">
                      {SERVICE_TYPES.map((serviceType) => (
                        <button
                          key={serviceType.value}
                          onClick={() => setSelectedType(serviceType.type)}
                          className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                            selectedType === serviceType.type
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'hover:bg-primary/5 text-foreground'
                          }`}
                        >
                          {serviceType.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Info */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">محدوده قیمت</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                        <span>ارزان‌ترین</span>
                        <span className="font-bold text-foreground">
                          {Math.min(...filteredServices.map((s) => s.price)).toLocaleString(
                            'fa-IR'
                          )}{' '}
                          تومان
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                        <span>گران‌ترین</span>
                        <span className="font-bold text-foreground">
                          {Math.max(...filteredServices.map((s) => s.price)).toLocaleString(
                            'fa-IR'
                          )}{' '}
                          تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration Range Info */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">مدت زمان</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                        <span>سریع‌ترین</span>
                        <span className="font-bold text-foreground">
                          {Math.floor(Math.min(...filteredServices.map((s) => s.duration)) / 60)}{' '}
                          ساعت
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
                        <span>طولانی‌ترین</span>
                        <span className="font-bold text-foreground">
                          {Math.floor(Math.max(...filteredServices.map((s) => s.duration)) / 60)}{' '}
                          ساعت
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Services Grid */}
          <div className="flex-1">
            {filteredServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="glass-effect-strong border border-primary/10 rounded-2xl p-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">خدمتی یافت نشد</h3>
                  <p className="text-muted-foreground mb-6">
                    لطفاً فیلترهای خود را تغییر دهید یا جستجوی دیگری انجام دهید
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    پاک کردن فیلترها
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ServiceCard service={service} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />
    </div>
  );
}
