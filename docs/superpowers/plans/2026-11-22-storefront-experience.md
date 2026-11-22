# Storefront Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve hero conversion and Core Web Vitals, add fully wired shop filters, and correct storefront SEO signals.

**Architecture:** Shared pure query logic drives both Fastify and bundled catalog results. Next.js server components render static content while small client boundaries handle category tabs, product tabs and filters. CSS provides decorative scroll progress without JavaScript.

**Tech Stack:** Next.js 16, React 19, TypeScript, Fastify, Prisma, Tailwind/CSS modules, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-22-storefront-experience-design.md`

## Global Constraints

- No new dependency and no database migration.
- Do not alter existing payment/configuration work outside this scope.
- Use Next.js 16 image guidance: no deprecated `priority` prop in changed components.
- Keep filter behavior identical in API, offline and URL round trips.
- Run focused tests after each red/green cycle and all project checks before completion.
- Do not commit; the user did not request git mutations.

## Review Focus

- Malformed URL numbers must not crash or create invalid filters; cover in shop-query tests.
- A selected discount must be a real discount below list price; cover in shared query tests.
- Desktop and mobile filter panels must expose identical state; verify in browser at two viewports.
- Only one initial hero image may be high priority; inspect rendered HTML/network behavior.
- Filtered shop URLs must be `noindex, follow` while `/shop` remains indexable; cover metadata unit tests and browser head inspection.

---

### Task 1: Shared and API filter contract

**Files:**
- Modify: `packages/shared/src/types/index.ts`
- Modify: `packages/shared/src/utils/product-query.ts`
- Test: `packages/shared/src/utils/product-query.test.ts`
- Modify: `apps/api/src/schemas/index.ts`
- Test: `apps/api/src/schemas/catalog-query.test.ts`
- Modify: `apps/api/src/routes/products.ts`
- Test: `apps/api/src/routes/products.test.ts`

**Interfaces:**
- Produces: `ProductListQuery.minDiscount?: number`, `minReviews?: number`, `editorChoice?: boolean`, and `sortBy: 'discount'`.
- Consumes: existing `discountPercent`, `reviewCount` and `editorChoice` product data.

- [ ] Write failing tests proving minimum discount, minimum review count and editor-only filtering, plus descending discount sorting.
- [ ] Run `pnpm --filter @technokhan/shared test`; confirm failures are caused by missing behavior.
- [ ] Implement the shared filters and sort using `discountPercent`.
- [ ] Add failing API schema/route tests for the new public query fields.
- [ ] Run `pnpm --filter api test`; confirm the new assertions fail for missing fields.
- [ ] Accept the fields in `productQuerySchema` and prefilter database `editorChoice`/`reviewCount`; shared filtering still computes percentage discounts.
- [ ] Re-run both suites and confirm all tests pass.

### Task 2: Shop URL and filter experience

**Files:**
- Modify: `apps/web/src/lib/shop-query.ts`
- Test: `apps/web/src/lib/shop-query.test.ts`
- Test: `apps/web/src/lib/shop-query-url.test.ts`
- Modify: `apps/web/src/components/storefront/shop-client.tsx`

**Interfaces:**
- Consumes: Task 1 query fields.
- Produces: round-trip URL keys `minDiscount`, `minReviews`, `editorChoice`, `sort=discount`; identical controlled filters on desktop and mobile.

- [ ] Extend URL tests with the new fields and discount sorting; run focused web tests and verify RED.
- [ ] Implement parsing/serialization with defaults omitted and input trimmed.
- [ ] Add direct price fields, discount/review thresholds, editor-only switch, expanded real feature options, highest-discount sorting and removable chips.
- [ ] Defer result rendering for rapidly changing controlled filter input with React's deferred value.
- [ ] Re-run web tests and type-check the web workspace.

### Task 3: Hero and rendering performance

**Files:**
- Create: `apps/web/src/components/home/home-product-tabs.tsx`
- Modify: `apps/web/src/components/home/home-page.tsx`
- Modify: `apps/web/src/components/home/hero-showcase.tsx`
- Modify: `apps/web/src/components/home/hero-showcase.module.css`
- Modify: `apps/web/src/components/storefront/product-grid.tsx`
- Modify: `apps/web/src/components/storefront/product-card.tsx`
- Create: `apps/web/src/components/ui/scroll-progress.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/components/analytics/google-analytics.tsx`

**Interfaces:**
- Produces: `ProductGrid.priorityCount?: number` (default `0`); shop passes `2`.
- Produces: a server-rendered `ScrollProgress` using CSS scroll timelines.

- [ ] Convert `HomePage` to a server component and isolate product tabs in one client boundary receiving the product array once.
- [ ] Preserve the original 3D autoplay hero exactly as requested; only modernize image loading so the active image is eager/high priority and hidden shelf images are lazy/low priority.
- [ ] Make product grids lazy by default and replace deprecated Next image priority props in changed components.
- [ ] Replace the global Framer Motion scroll indicator with CSS progressive enhancement and defer Analytics with `lazyOnload`.
- [ ] Run web tests, lint and type-check; inspect the home and shop pages at desktop/mobile sizes.

### Task 4: SEO correctness and final verification

**Files:**
- Modify: `apps/web/src/app/shop/page.tsx`
- Modify: `apps/web/src/lib/seo.ts`
- Test: `apps/web/src/lib/seo.test.ts`

**Interfaces:**
- Produces: `getShopMetadata(params: ShopSearchParams): Metadata` in `lib/seo.ts` with canonical `/shop`; default view indexable, all non-default discovery states `noindex, follow`.
- Corrects: structured business type to `Store` and gadget imagery.

- [ ] Write failing metadata tests for default and filtered shop URLs, and a failing structured-data test for the automotive remnant.
- [ ] Run focused tests and verify RED.
- [ ] Implement metadata generation and structured-data corrections.
- [ ] Re-run all web, shared and API tests; run root type-check/lint/build.
- [ ] Exercise hero category selection, filter URL round trips, filtered metadata and responsive layouts in the built-in browser.
- [ ] Inspect `git status` and remove only artifacts created by this verification that are not deliverables.
