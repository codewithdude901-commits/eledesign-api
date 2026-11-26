# Plan: Fix post-checkout redirect to English order page

## Problem
The email part now works (English email with English links), but the post-checkout redirect in `ConfirmOrder.tsx` still lands on the German order page.

## Root Cause
`ConfirmOrder.tsx` uses `usePathname()` to detect the locale, but this may not reliably return the locale prefix. The `ConfirmOrderPage` component at `src/app/(app)/[locale]/checkout/confirm-order/page.tsx` receives `params` (including `locale`) but doesn't extract or pass it to `ConfirmOrder`.

## Solution
Pass the locale from the page component as a prop to `ConfirmOrder`, ensuring reliable locale detection:

1. Update `ConfirmOrderPage` to extract `locale` from params and pass it to `ConfirmOrder`
2. Update `ConfirmOrder` to accept a `locale` prop instead of relying on `usePathname()`

## Files to edit
- `src/app/(app)/[locale]/checkout/confirm-order/page.tsx` — extract locale from params, pass to ConfirmOrder
- `src/components/checkout/ConfirmOrder.tsx` — accept locale prop, use it for redirect

## Validation
- Manual: English checkout → redirects to /en/orders/{id}
- Manual: German checkout → redirects to /de/orders/{id}