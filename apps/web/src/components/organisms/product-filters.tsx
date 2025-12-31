'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Tag,
  Palette,
  Package,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { ProductCategory } from '@autolounge/shared';

export interface ProductFilters {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  rating: number | null;
  inStock: boolean;
  hasDiscount: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  availableCategories: { value: string; label: string; count: number }[];
  availableBrands: { value: string; label: string; count: number }[];
  priceRange: [number, number];
  isOpen: boolean;
  onToggle: () => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'rating', label: 'بالاترین امتیاز' },
  { value: 'name-asc', label: 'نام (الف-ی)' },
  { value: 'name-desc', label: 'نام (ی-الف)' },
];

const RATING_OPTIONS = [
  { value: 4, label: '۴ ستاره و بالاتر' },
  { value: 3, label: '۳ ستاره و بالاتر' },
  { value: 2, label: '۲ ستاره و بالاتر' },
  { value: 1, label: '۱ ستاره و بالاتر' },
];

export function ProductFiltersPanel({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  priceRange,
  isOpen,
  onToggle,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    rating: false,
    options: false,
  });

  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handleRatingChange = (rating: number | null) => {
    onFiltersChange({ ...filters, rating });
  };

  const handlePriceRangeChange = () => {
    onFiltersChange({ ...filters, priceRange: localPriceRange });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      categories: [],
      brands: [],
      priceRange: priceRange,
      rating: null,
      inStock: false,
      hasDiscount: false,
      sortBy: 'newest',
    });
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.rating !== null ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0) +
    (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1] ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="lg:w-80 shrink-0"
        >
          <div className="glass-effect-strong border border-primary/10 rounded-2xl overflow-hidden sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">فیلترها</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                پاک کردن
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Sort Section */}
              <FilterSection
                title="مرتب‌سازی"
                icon={<Tag className="h-4 w-4" />}
                isExpanded={true}
                onToggle={() => {}}
              >
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-all ${
                        filters.sortBy === option.value
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted/50 hover:bg-muted text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Categories */}
              <FilterSection
                title="دسته‌بندی"
                icon={<Package className="h-4 w-4" />}
                isExpanded={expandedSections.categories}
                onToggle={() => toggleSection('categories')}
              >
                <div className="space-y-2">
                  {availableCategories.map((category) => (
                    <label
                      key={category.value}
                      className="flex items-center justify-between gap-3 cursor-pointer hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={filters.categories.includes(category.value)}
                          onChange={() => handleCategoryToggle(category.value)}
                        />
                        <span className="text-foreground">{category.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Brands */}
              <FilterSection
                title="برند"
                icon={<Palette className="h-4 w-4" />}
                isExpanded={expandedSections.brands}
                onToggle={() => toggleSection('brands')}
              >
                <div className="space-y-2">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand.value}
                      className="flex items-center justify-between gap-3 cursor-pointer hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={filters.brands.includes(brand.value)}
                          onChange={() => handleBrandToggle(brand.value)}
                        />
                        <span className="text-foreground">{brand.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {brand.count}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection
                title="محدوده قیمت"
                icon={<Tag className="h-4 w-4" />}
                isExpanded={expandedSections.price}
                onToggle={() => toggleSection('price')}
              >
                <div className="space-y-4">
                  {/* Price Slider */}
                  <div className="px-2">
                    <div className="relative h-2 bg-muted rounded-full">
                      <div
                        className="absolute h-full bg-primary rounded-full"
                        style={{
                          right: `${((localPriceRange[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                          left: `${100 - ((localPriceRange[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <input
                        type="range"
                        min={priceRange[0]}
                        max={priceRange[1]}
                        value={localPriceRange[0]}
                        onChange={(e) =>
                          setLocalPriceRange([
                            Math.min(Number(e.target.value), localPriceRange[1] - 100000),
                            localPriceRange[1],
                          ])
                        }
                        onMouseUp={handlePriceRangeChange}
                        onTouchEnd={handlePriceRangeChange}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <input
                        type="range"
                        min={priceRange[0]}
                        max={priceRange[1]}
                        value={localPriceRange[1]}
                        onChange={(e) =>
                          setLocalPriceRange([
                            localPriceRange[0],
                            Math.max(Number(e.target.value), localPriceRange[0] + 100000),
                          ])
                        }
                        onMouseUp={handlePriceRangeChange}
                        onTouchEnd={handlePriceRangeChange}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="bg-muted px-3 py-1.5 rounded-lg">
                      <span className="text-muted-foreground">از:</span>{' '}
                      <span className="font-medium">{formatPrice(localPriceRange[0])}</span>
                    </div>
                    <div className="bg-muted px-3 py-1.5 rounded-lg">
                      <span className="text-muted-foreground">تا:</span>{' '}
                      <span className="font-medium">{formatPrice(localPriceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Rating */}
              <FilterSection
                title="امتیاز"
                icon={<Star className="h-4 w-4" />}
                isExpanded={expandedSections.rating}
                onToggle={() => toggleSection('rating')}
              >
                <div className="space-y-2">
                  {RATING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleRatingChange(
                          filters.rating === option.value ? null : option.value
                        )
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        filters.rating === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < option.value
                                ? filters.rating === option.value
                                  ? 'fill-primary-foreground text-primary-foreground'
                                  : 'fill-yellow-500 text-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">و بالاتر</span>
                      {filters.rating === option.value && (
                        <Check className="h-4 w-4 mr-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Options */}
              <FilterSection
                title="گزینه‌ها"
                icon={<Check className="h-4 w-4" />}
                isExpanded={expandedSections.options}
                onToggle={() => toggleSection('options')}
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors">
                    <Checkbox
                      checked={filters.inStock}
                      onChange={(e) =>
                        onFiltersChange({ ...filters, inStock: e.target.checked })
                      }
                    />
                    <span className="text-foreground">فقط محصولات موجود</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors">
                    <Checkbox
                      checked={filters.hasDiscount}
                      onChange={(e) =>
                        onFiltersChange({ ...filters, hasDiscount: e.target.checked })
                      }
                    />
                    <span className="text-foreground">فقط محصولات تخفیف‌دار</span>
                  </label>
                </div>
              </FilterSection>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-b border-primary/5 pb-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-foreground hover:text-primary transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
