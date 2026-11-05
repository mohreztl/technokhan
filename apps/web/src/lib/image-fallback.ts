import type { SyntheticEvent } from 'react';

/** Replaces an unavailable image once, without creating an error loop. */
export function handleImageError(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/images/placeholder-product.webp';
}
