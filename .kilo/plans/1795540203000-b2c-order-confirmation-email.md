# Plan: B2C order confirmation email

## Goal
Send an order-confirmation email to the customer for B2C checkouts (both logged-in and guest), triggered automatically when a B2C order reaches `completed` status.

## Approach
Mirror the existing B2B confirmation flow (`sendB2BOrderConfirmation` in `src/b2b/emails/sendOrderEmails.ts` and the `void sendB2BOrderConfirmation(...)` call in `src/app/(app)/api/b2b/checkout/route.ts`), but for B2C orders which go through the ecommerce plugin's Stripe `confirmOrder` flow (no custom checkout route). Use an `afterChange` hook on the orders collection so both guest and logged-in checkouts are covered.

## New files

1. `src/b2c/emails/sendB2COrderConfirmation.ts`
   - Export `sendB2COrderConfirmation({ locale = 'de', order, payload })`.
   - Recipient = `order.customerEmail` (fallback to customer email if populated). Return early if none.
   - Subject: `Order confirmation / Bestellbestätigung` with order id.
   - HTML: thank-you heading, items table (product, qty, unit, line total), total, and a link to view the order: `${serverURL}/orders/${order.id}?email=${encodedEmail}&accessToken=${order.accessToken}` (works for guests and logged-in users).
   - Locale defaults to `'de'` (no locale stored on Order; could later read from customer).
   - Wrap `payload.sendEmail` in try/catch and log on failure (mirror `send` helper in sendOrderEmails.ts).
   - Guard with `process.env.NODE_ENV === 'test'` / `VITEST` like other B2C emails.

2. `src/b2c/hooks/orderHooks.ts`
   - Export `sendB2COrderConfirmationAfterChange: CollectionAfterChangeHook`.
   - Cast doc to order shape (`id`, `channel`, `status`, `customerEmail`, `customer`, `items`, `amount`, `currency`, `accessToken`).
   - Return early if `channel !== 'b2c'` (treat null/undefined as b2c).
   - Return early if `status !== 'completed'`.
   - Return early if `previousDoc?.status === 'completed'` (avoid duplicates on re-saves).
   - Resolve recipient; if none, return.
   - `void sendB2COrderConfirmation({ locale: 'de', order, payload })`.
   - Return doc.

## Edited files

3. `src/b2b/pluginOverrides.ts` — `b2bOrdersCollectionOverride`:
   - Import `sendB2COrderConfirmationAfterChange` from `@/b2c/hooks/orderHooks`.
   - In `hooks.afterChange`, append it: `afterChange: [syncB2BOrderAfterChange, sendB2COrderConfirmationAfterChange]`.
   - `syncB2BOrderAfterChange` already returns early for non-b2b channels, so no conflict.

## Notes / decisions
- Trigger on `completed` transition (not on create) because B2C Stripe orders are created during checkout and only become `completed` after `confirmOrder` succeeds. This avoids emailing unpaid/pending orders.
- Idempotency via previous-status check; re-saving a completed order won't re-send.
- Guest + logged-in both covered because `customerEmail` is set by the plugin from `additionalData.customerEmail` (guest) or the customer's email (logged-in), and `accessToken` is auto-generated on the order.
- No changes to `ConfirmOrder.tsx` or checkout routes; the hook handles delivery centrally.
- Locale hardcoded to `'de'` for now; could be extended later if a locale is persisted on the order/customer.

## Validation
- Typecheck: `pnpm exec tsc --noEmit` (filter for the new/edited files).
- Lint: `pnpm exec eslint src/b2c/emails/sendB2COrderConfirmation.ts src/b2c/hooks/orderHooks.ts src/b2b/pluginOverrides.ts`.
- Manual: place a B2C order as guest and as logged-in user; confirm one confirmation email arrives with a working order link; re-save the order in admin and confirm no duplicate email.