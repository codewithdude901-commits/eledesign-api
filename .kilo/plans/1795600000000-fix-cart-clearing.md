# Plan: Fix cart clearing after guest checkout

## Problem
Cart is not consistently cleared after checkout. When payment succeeds immediately (`redirect: 'if_required'`), `clearCart()` is called in `CheckoutForm`. But when payment goes through Stripe redirect (3D Secure), the `ConfirmOrder` component handles confirmation and never calls `clearCart()`, leaving stale cart items.

## Root Cause
- `src/components/forms/CheckoutForm/index.tsx` line 110: calls `clearCart()` only in the immediate-success path.
- `src/components/checkout/ConfirmOrder.tsx`: never calls `clearCart()` — this is the Stripe-redirect confirmation path.

## Solution
Add `clearCart()` call in `ConfirmOrder.tsx` after successful order confirmation, before redirecting to the order page. Also ensure `clearCart` is imported from `useCart()`.

## Files to edit
- `src/components/checkout/ConfirmOrder.tsx` — destructure `clearCart` from `useCart()`, call it after successful confirmation.

## Validation
- Manual: Guest checkout with immediate payment → cart cleared
- Manual: Guest checkout with 3D Secure redirect → cart cleared after redirect
- Manual: Verify cart icon shows 0 items after both flows