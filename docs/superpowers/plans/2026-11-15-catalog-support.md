# Catalog and Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category/brand indexes, real support-ticket submission, configured contact links, and accessible hero autoplay.

**Architecture:** Server Components render catalog indexes from existing repository data. Client components reuse the contact API for tickets and site settings for contact links. Pure helpers cover counting, contact-link validation, and autoplay eligibility.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, react-hook-form, zod, node:test.

**Spec:** `docs/superpowers/specs/2026-11-15-catalog-support-design.md`

## Global Constraints

- Preserve the existing Persian RTL design and API fallback behavior.
- Do not invent contact details or add dependencies.
- Write behavior tests before each new helper and watch them fail first.

## Review Focus

- Products without a brand must not create an unknown brand entry; test in the counting helper.
- Empty or malformed phone/WhatsApp settings must not produce broken links; test in the contact helper.
- Reduced motion, manual pause, focus, hover, hidden tab, and offscreen states must stop autoplay; test the eligibility helper.
- Ticket failures remain visible and successful submissions return the API ticket id; verify in the browser.
- New routes must work on narrow and wide viewports; verify in the browser.

---

### Task 1: Catalog indexes

**Files:**
- Create: `apps/web/src/lib/catalog-counts.ts`, `apps/web/src/lib/catalog-counts.test.ts`
- Create: `apps/web/src/app/categories/page.tsx`, `apps/web/src/app/brands/page.tsx`
- Modify: navbar, home sections, footer, and sitemap.

- [ ] Write failing tests for category counts and case-insensitive brand counts, including missing brands.
- [ ] Run `pnpm --filter web test -- src/lib/catalog-counts.test.ts` and confirm module-not-found failure.
- [ ] Implement `getCatalogCounts(products)` and minimal server pages/navigation links.
- [ ] Run the helper test and type-check.

### Task 2: Ticket and contact channels

**Files:**
- Create: `apps/web/src/components/support/support-contact.ts`, `apps/web/src/components/support/support-contact.test.ts`, `support-contact-links.tsx`
- Modify: `apps/web/src/components/support/smart-support.tsx`, `apps/web/src/app/contact/client.tsx`, shared social constants.

- [ ] Write failing tests for tel normalization, invalid WhatsApp rejection, and Bale output.
- [ ] Run the focused test and confirm the expected failure.
- [ ] Implement `getSupportContactLinks(settings)`, reusable links, and the validated ticket form using `contactApi.send`.
- [ ] Run the focused test and type-check; verify success and validation in the browser.

### Task 3: Hero autoplay

**Files:**
- Modify: `apps/web/src/components/home/hero-shelf-utils.ts` and its test.
- Modify: `apps/web/src/components/home/hero-showcase.tsx` and `hero-showcase.module.css`.

- [ ] Add failing tests for `shouldAutoplay` across all pause conditions.
- [ ] Run the focused test and confirm the missing-export failure.
- [ ] Implement the five-second interval, visibility observers, interaction handlers, and pause/play control.
- [ ] Run the focused test and verify autoplay/manual controls in the browser.

### Task 4: Verification and delivery

- [ ] Run `pnpm test`, `pnpm type-check`, `pnpm lint`, and `pnpm build`.
- [ ] Check `/categories`, `/brands`, ticket submission, contact links, and hero autoplay at mobile and desktop sizes.
- [ ] Review `git status` and the complete diff, excluding the pre-existing `.playwright-mcp/` directory.
- [ ] Commit the requested changes and push `main` to `origin`.
