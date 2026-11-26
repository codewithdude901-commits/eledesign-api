# Plan: Align ConfirmOrder.tsx with official template

## Context
`src/components/checkout/ConfirmOrder.tsx` currently mixes locale detection, redirect-status checks, and error handling that diverge from the official Payload ecommerce template. The checkout flow supports three Stripe payment methods (cards, Amazon Pay, Klarna), all of which redirect back to `/checkout/confirm-order` with `payment_intent` (and sometimes `redirect_status`). The redirect after confirmation must preserve the active locale (`de`/`en`).

## Goal
Rewrite `ConfirmOrder` to follow the official template structure while preserving:
- Locale-aware redirect (`/${locale}/orders/...`)
- `clearCart()` after successful confirmation
- Handling of `email` query param
- Only the three supported payment methods (no extra handling)

## Affected file
- `src/components/checkout/ConfirmOrder.tsx`

## Changes
1. Accept `locale` prop (already passed by page).
2. Remove `redirectStatus` early-return blocking (template confirms whenever `payment_intent` present; Amazon Pay/Klarna redirects may omit `redirect_status`).
3. Use `router.push` with locale-prefixed order URL instead of `window.location.href`.
4. Call `clearCart()` before redirect.
5. Keep `isConfirming` ref guard.
6. If no `payment_intent`, redirect to locale home `/`.
7. Render simple "Confirming Order" UI with spinner.

## Validation
- `pnpm exec tsc --noEmit`
- Manual: card, Amazon Pay, Klarna flows redirect to correct locale order page and cart clears.
