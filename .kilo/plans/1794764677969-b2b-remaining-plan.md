# B2B Layer — Remaining Work Plan

## Current State

The B2B layer is substantially complete:

- **Backend**: `src/access/b2b.ts`, `Users`/`BusinessApplications`/`Counters` collections, `B2BSettings` global, all registered in `src/payload.config.ts`; ecommerce plugin overrides in `src/plugins/index.ts` (guarded Stripe + invoice adapter, import/export with B2B fields); cart/order pricing hooks, invoice adapter, email utilities, pricing utilities, invoice numbering.
- **Frontend**: All business portal pages under `src/app/(app)/[locale]/business/` (login, apply, forgot-password, reset-password, logout, dashboard, catalog, catalog/[slug], cart, checkout, orders, orders/[id], orders/[id]/invoice, account, addresses) and all `src/components/business/*` components; `Navbar.tsx` updated for business paths.
- **API**: `src/app/(app)/api/b2b/checkout/route.ts`, `src/app/(app)/api/business/forgot-password/route.ts`.
- **Tests**: `tests/int/b2b-approval.int.spec.ts`, `tests/int/b2b-auth.int.spec.ts`, `tests/int/b2b-pricing.int.spec.ts` (16 int tests pass per prior run).
- **Scripts**: `src/scripts/backfill-b2b-defaults.ts` exists.
- **Verification**: `pnpm build` and `npx vitest run` (16 tests) previously passed; `tsc --noEmit` had only pre-existing unrelated errors.

## Resolved Decision

**Admin dashboard visibility**: "Hide from dashboard only" — globals (Home Page, Header, Footer) and Content sections (Pages, Categories, Media, Forms, Form Submissions) should remain accessible via the sidebar nav but not appear on the default admin dashboard welcome view. `admin.hidden: true` is NOT appropriate (it removes sidebar access too). Instead, implement a `beforeDashboard` component that replaces the default welcome view with B2B-relevant shortcuts.

## Remaining Tasks

1. **Admin dashboard customization** (`src/components/BeforeDashboard/index.ts` + `payload.config.ts`):
   - Create a `BeforeDashboard` client component that renders B2B shortcuts (Business Applications, Users with B2B fields, Orders with channel/b2bStatus filters) instead of the default welcome cards.
   - Uncomment and wire `beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard']` into `src/payload.config.ts` admin components.
   - Keep all collections and globals visible in the sidebar nav (do not set `admin.hidden: true`).

2. **B2B end-to-end test** (`tests/e2e/b2b.e2e.spec.ts`):
   - Apply → admin approve → set password → business login.
   - Catalog shows B2B net prices, not retail.
   - Add to cart → cart shows discounted net line totals.
   - Checkout → order detail shows invoice and bank details.
   - Admin marks invoice paid → partner sees `paid`.
   - B2C smoke test: login, product page, cart, Stripe test checkout still work.

3. **Final verification**:
   - `pnpm lint`
   - `pnpm exec tsc --noEmit` (confirm only pre-existing unrelated errors)
   - `npx vitest run` (all int tests pass)
   - `pnpm build`

## Plan Location

`D:\eledesign\eledesign_ecom_api\.kilo\plans\1794764677969-b2b-remaining-plan.md`

## Handoff

This plan is ready for implementation. Switch to an implementation-capable agent to execute tasks 1–3 above. No source-code changes are needed for the core B2B layer — it is already complete.