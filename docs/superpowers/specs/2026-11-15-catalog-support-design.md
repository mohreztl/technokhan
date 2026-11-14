# Catalog and Support Design

## Intent

Give shoppers direct routes for browsing all categories and brands, turn the smart-support widget into a real ticket entry point, expose configured contact channels, and make the existing hero advance automatically without taking control away from the user.

## Goals

- Add `/categories` and `/brands` using the shared catalog and real product counts.
- Link both indexes from the navbar, home page, footer, and sitemap.
- Add a validated ticket form inside smart support, backed by the existing contact API and demo transport.
- Show telephone and WhatsApp only when usable values exist in site settings; provide the Bale channel from shared social settings.
- Advance the hero every five seconds, with pause/play, hover/focus pauses, viewport/document visibility handling, and reduced-motion support.

## Non-goals

- No new ticketing database or admin workflow; contact messages already provide persistence and administration.
- No separate brand-detail route; brand cards lead to the existing filtered shop.
- No invented telephone number or WhatsApp account.

## Constraints and approach

Keep Next.js server pages, shared catalog types, Tailwind styles, react-hook-form/zod validation, and existing API conventions. The alternative of introducing new catalog data or a parallel ticket endpoint would duplicate working infrastructure and is rejected. The existing visual system—Vazirmatn, neutral surfaces, lime secondary accent, image-led category cards and typographic brand cards—remains unchanged.

## Builder decisions

Use a five-second autoplay interval. Keep manual navigation available while paused. Render a Bale link using the shared `https://ble.ir/technokhan` account and omit phone/WhatsApp actions until their configured values are valid.
