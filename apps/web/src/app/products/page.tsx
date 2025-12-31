'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Grid3x3, List } from 'lucide-react';
import { ProductCard } from '@/components/molecules/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { ProductCategory } from '@autolounge/shared';

// Mock data - replace with API call later
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'واکس کارناوبا پریمیوم',
    nameEn: 'Premium Carnauba Wax',
    description: 'واکس طبیعی با درخشش فوق‌العاده و دوام بالا',
    descriptionEn: 'Natural wax with exceptional shine and high durability',
    price: 2500000,
    discountPrice: 2250000,
    category: ProductCategory.DETAILING,
    images: ['/products/wax1.jpg'],
    stock: 15,
    featured: true,
    brand: "Meguiar's",
    rating: 4.8,
    reviewCount: 156,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'شامپو میکروفایبر دوطرفه',
    nameEn: 'Premium Microfiber Towel',
    description: 'دستمال نرم و جاذب برای خشک کردن بدون خط‌اندازی',
    descriptionEn: 'Soft and absorbent towel for scratch-free drying',
    price: 450000,
    category: ProductCategory.ACCESSORIES,
    images: ['/products/towel1.jpg'],
    stock: 45,
    featured: false,
    brand: 'Chemical Guys',
    rating: 4.9,
    reviewCount: 234,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'کیت دیتیلینگ حرفه‌ای',
    nameEn: 'Professional Detailing Kit',
    description: 'ست کامل ۱۲ قطعه برای دیتیلینگ داخلی و خارجی',
    descriptionEn: 'Complete 12-piece kit for interior and exterior detailing',
    price: 5800000,
    discountPrice: 4950000,
    category: ProductCategory.TOOLS,
    images: ['/products/kit1.jpg'],
    stock: 8,
    featured: true,
    brand: "Griot's Garage",
    rating: 4.7,
    reviewCount: 89,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'سرامیک کوتینگ 9H',
    nameEn: '9H Ceramic Coating',
    description: 'محافظت حرفه‌ای رنگ خودرو تا ۵ سال',
    descriptionEn: 'Professional paint protection for up to 5 years',
    price: 8500000,
    category: ProductCategory.DETAILING,
    images: ['/products/ceramic1.jpg'],
    stock: 12,
    featured: true,
    brand: 'Gtechniq',
    rating: 4.9,
    reviewCount: 312,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'پولیش کامپاوند',
    nameEn: 'Compound Polish',
    description: 'برطرف کننده خطوط عمیق و اکسیداسیون',
    descriptionEn: 'Removes deep scratches and oxidation',
    price: 1850000,
    category: ProductCategory.DETAILING,
    images: ['/products/polish1.jpg'],
    stock: 25,
    featured: false,
    brand: '3M',
    rating: 4.6,
    reviewCount: 178,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    name: 'پد پولیش نرم',
    nameEn: 'Soft Polishing Pad',
    description: 'پد فومی برای صیقل نهایی',
    descriptionEn: 'Foam pad for final polish',
    price: 380000,
    category: ProductCategory.ACCESSORIES,
    images: ['/products/pad1.jpg'],
    stock: 60,
    featured: false,
    brand: 'Menzerna',
    rating: 4.5,
    reviewCount: 92,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '7',
    name: 'کوتینگ شیشه‌ای نانو',
    nameEn: 'Nano Glass Coating',
    description: 'محافظت نانو شیشه‌ها و بهبود دید در باران',
    descriptionEn: 'Nano protection for windows and improved rain visibility',
    price: 1250000,
    category: ProductCategory.DETAILING,
    images: ['/products/glass1.jpg'],
    stock: 18,
    featured: false,
    brand: 'Rain-X',
    rating: 4.7,
    reviewCount: 145,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-25'),
  },
  {
    id: '8',
    name: 'رپ کربن ۵D',
    nameEn: '5D Carbon Wrap',
    description: 'رپ کربن برجسته با کیفیت بالا - رول ۱۵۲ سانتی',
    descriptionEn: 'High quality textured carbon wrap - 152cm roll',
    price: 3200000,
    category: ProductCategory.CAR_WRAP,
    images: ['/products/carbon1.jpg'],
    stock: 10,
    featured: true,
    brand: '3M',
    rating: 4.8,
    reviewCount: 67,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

const CATEGORIES = [
  { value: 'all', label: 'همه محصولات' },
  { value: 'detailing', label: 'دیتیلینگ' },
  { value: 'car_wrap', label: 'رپینت' },
  { value: 'accessories', label: 'لوازم جانبی' },
  { value: 'tools', label: 'ابزار' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
];

const BRANDS = [
  "Meguiar's",
  'Chemical Guys',
  "Griot's Garage",
  'Gtechniq',
  '3M',
  'Menzerna',
  'Rain-X',
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // Brand filter
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      // Price filter
      const price = product.discountPrice || product.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-desc':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedBrands, priceRange, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange([0, 10000000]);
    setSortBy('newest');
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (priceRange[0] !== 0 || priceRange[1] !== 10000000 ? 1 : 0);

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
            فروشگاه
          </Badge>
          <h1 className="section-title text-gradient-luxury mb-4">محصولات اتولانژ</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            بهترین محصولات دیتیلینگ و مراقبت از خودرو با بهترین کیفیت و قیمت
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
                placeholder="جستجوی محصولات..."
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
              <span className="text-muted-foreground">{filteredProducts.length} محصول یافت شد</span>
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

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 glass-effect border border-primary/10 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
                className="w-40"
              />
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
                  {/* Categories */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">دسته‌بندی</h3>
                    <div className="space-y-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                            selectedCategory === category.value
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'hover:bg-primary/5 text-foreground'
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">برند</h3>
                    <div className="space-y-2">
                      {BRANDS.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                          />
                          <span className="text-foreground">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">محدوده قیمت</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                          }
                          className="w-full"
                          placeholder="از"
                        />
                        <span className="text-muted-foreground">تا</span>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])
                          }
                          className="w-full"
                          placeholder="تا"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        {priceRange[0].toLocaleString('fa-IR')} -{' '}
                        {priceRange[1].toLocaleString('fa-IR')} تومان
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="glass-effect-strong border border-primary/10 rounded-2xl p-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">محصولی یافت نشد</h3>
                  <p className="text-muted-foreground mb-6">
                    لطفاً فیلترهای خود را تغییر دهید یا جستجوی دیگری انجام دهید
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    پاک کردن فیلترها
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-6'
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
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
