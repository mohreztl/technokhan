# Storefront Experience Design

## Intent

Improve TechnoKhan's product discovery and first-screen conversion while reducing initial browser work and correcting search-engine signals. The audience is Persian-speaking shoppers comparing original gadgets by real specifications, price, discount and buyer feedback.

## Goals

- Make the hero clearer, visually distinctive and stable on mobile and desktop.
- Keep only the initial hero image at high network priority and render it in the server HTML.
- Add useful filters backed by existing catalog fields and make them shareable through the URL.
- Move static home-page markup back to React Server Components.
- Avoid high-priority below-the-fold product images and remove the global animation-library scroll indicator.
- Keep the canonical shop page indexable while preventing filter/sort/search URL combinations from creating duplicate indexed pages.
- Correct local-business structured data for a gadget store.

## Non-goals

- No new visual or state-management dependency.
- No database migration or new product fields.
- No redesign of checkout, account or unrelated service pages.
- No promise of a universal Lighthouse score without measuring the deployed production environment.

## Approaches

1. **Keep the existing 3D autoplay shelf and tune it.** Lowest structural change, but continuous timers, pointer-driven renders and competing carousel images remain at odds with LCP and INP goals.
2. **Replace the hero with a static banner.** Fastest, but loses useful category exploration and makes the storefront less distinctive.
3. **Preserve the established 3D category shelf and improve it non-visually.** The user explicitly requested the original hero appearance. Its autoplay, layout, palette, category navigation and responsive behavior remain intact; only image loading and surrounding rendering costs change.

For filters, deriving options from existing `Product` fields is preferred over adding cosmetic controls that the API cannot honor. For SEO, canonical category pages remain indexable; arbitrary shop query combinations use `noindex, follow` and canonicalize to `/shop`.

## Hero design constraints

- Preserve the original graphite/volt palette, Vazirmatn typography, 3D product shelf, category controls, autoplay and mobile presentation.
- Keep the initial active image eager and high priority; hidden shelf images use lazy loading and low priority.
- Do not introduce a new layout, copy treatment, color system or interaction model.

## Implementation contract

Add `minDiscount`, `minReviews` and `editorChoice` to `ProductListQuery`, plus `discount` sorting. Filtering uses the existing `discountPercent`, `reviewCount` and `editorChoice` fields in shared code so bundled and database-backed results agree. Public URLs use `minDiscount`, `minReviews`, `editorChoice=true` and `sort=discount`.

The shop also gains direct minimum/maximum price inputs, more real technical feature options, active-filter chips and a highest-discount sort. Product grids are lazy by default; only the shop's first two products may be marked high priority.

The global scroll indicator becomes pure CSS scroll-timeline progressive enhancement with no JavaScript fallback because it is decorative. Analytics uses `lazyOnload`.

## Assumptions

- Direct implementation in the current workspace is authorized; no worktree or commit is requested.
- Existing user changes in payment, environment and API configuration files must remain untouched.
- The existing volt color remains a brand accent, but no longer dominates a full-viewport dark animated hero.
- Filter combinations are discovery states, not separate SEO landing pages; category routes are the indexable landing pages.
