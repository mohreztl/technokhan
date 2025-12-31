'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { ProductFilters } from '@/components/organisms/product-filters';

interface ActiveFiltersProps {
  filters: ProductFilters;
  priceRange: [number, number];
  onRemoveCategory: (category: string) => void;
  onRemoveBrand: (brand: string) => void;
  onRemoveRating: () => void;
  onRemoveInStock: () => void;
  onRemoveDiscount: () => void;
  onResetPrice: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  priceRange,
  onRemoveCategory,
  onRemoveBrand,
  onRemoveRating,
  onRemoveInStock,
  onRemoveDiscount,
  onResetPrice,
  onClearAll,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.rating !== null ||
    filters.inStock ||
    filters.hasDiscount ||
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1];

  if (!hasActiveFilters) return null;

  const priceChanged =
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 mb-6"
    >
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Tag className="h-4 w-4" />
        فیلترهای فعال:
      </span>

      <AnimatePresence mode="popLayout">
        {/* Price Range */}
        {priceChanged && (
          <motion.div
            key="price"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <FilterTag
              label={`قیمت: ${formatPrice(filters.priceRange[0]).replace('تومان', '')} - ${formatPrice(filters.priceRange[1])}`}
              onRemove={onResetPrice}
            />
          </motion.div>
        )}

        {/* Categories */}
        {filters.categories.map((category) => (
          <motion.div
            key={`cat-${category}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <FilterTag
              label={category}
              onRemove={() => onRemoveCategory(category)}
            />
          </motion.div>
        ))}

        {/* Brands */}
        {filters.brands.map((brand) => (
          <motion.div
            key={`brand-${brand}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <FilterTag
              label={brand}
              onRemove={() => onRemoveBrand(brand)}
            />
          </motion.div>
        ))}

        {/* Rating */}
        {filters.rating !== null && (
          <motion.div
            key="rating"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <FilterTag
              label={`${filters.rating} ستاره و بالاتر`}
              onRemove={onRemoveRating}
            />
          </motion.div>
        )}

        {/* In Stock */}
        {filters.inStock && (
          <motion.div
            key="inStock"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <FilterTag
              label="فقط موجود"
              onRemove={onRemoveInStock}
            />
          </motion.div>
        )}

        {/* Has Discount */}
        {filters.hasDiscount && (
          <motion.div
            key="discount"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <FilterTag
              label="تخفیف‌دار"
              onRemove={onRemoveDiscount}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className="text-sm text-red-500 hover:text-red-600 hover:underline transition-colors"
      >
        پاک کردن همه
      </button>
    </motion.div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="pl-2 pr-3 py-1.5 gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
