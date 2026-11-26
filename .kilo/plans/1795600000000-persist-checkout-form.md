# Plan: Persist checkout form data across locale switches

## Problem
When a user fills out the checkout form (email, billing/shipping address, terms checkbox) in one locale and then switches to another locale via the LocaleSwitcher, the full page navigation unmounts `CheckoutPage`, destroying all `useState` values. All typed data is lost.

## Current Architecture
- `CheckoutPage` (`src/components/checkout/CheckoutPage.tsx`) holds all form state via `useState`: `email`, `emailEditable`, `paymentData`, `shippingAddress`, `billingAddress`, `billingAddressSameAsShipping`, `isProcessingPayment`, `termsAccepted` (in CheckoutForm).
- `CheckoutForm` receives `customerEmail`, `billingAddress`, `shippingAddress` as props.
- Locale switch uses `LocaleSwitcher` → full URL navigation (`/de/checkout` ↔ `/en/checkout`) → component unmounts → all state lost.
- A cleanup `useEffect` (line 135-143) explicitly resets state on unmount.

## Approach: sessionStorage persistence
Use `sessionStorage` to persist form state on every change and restore on mount. This survives locale-switch navigation (same tab/session) but clears when the tab closes. No server changes needed.

### State to persist
- `email` (string)
- `billingAddress` (Partial<Address> — persist by address ID, resolve on restore)
- `shippingAddress` (Partial<Address> — persist by address ID, resolve on restore)
- `billingAddressSameAsShipping` (boolean)
- `emailEditable` (boolean)
- `termsAccepted` (boolean — in CheckoutForm, needs lifting or separate storage)

### State NOT to persist
- `paymentData` (Stripe client secret — must re-initiate after locale switch; Stripe Elements need re-mounting anyway)
- `isProcessingPayment` (transient)

### Implementation

**CheckoutPage.tsx changes:**
1. On mount: read `sessionStorage.getItem('checkout-form-state')`, parse JSON, initialize state. Guard with `typeof window !== 'undefined'`.
2. On change: a `useEffect` watching `[email, billingAddress, shippingAddress, billingAddressSameAsShipping, emailEditable]` writes to sessionStorage.
3. On successful checkout (or cart empty): `sessionStorage.removeItem('checkout-form-state')`.
4. Remove or modify the cleanup `useEffect` (line 135-143) so it doesn't wipe persisted state on locale-switch unmount. Instead, only reset on explicit "clear" actions.

**Address resolution on restore:**
- Persist `billingAddress.id` and `shippingAddress.id` (not the full object).
- On restore, find the matching address from `useAddresses()` result.
- If no match found (address deleted), fall back to default (addresses[0]).

**CheckoutForm.tsx changes:**
- Persist `termsAccepted` in sessionStorage under the same key or a separate key.
- Restore on mount.

### Files to edit
- `src/components/checkout/CheckoutPage.tsx` — sessionStorage read/write, address resolution, cleanup removal
- `src/components/forms/CheckoutForm/index.tsx` — persist/restore `termsAccepted`

### Risks
- **Stripe PaymentElement**: `paymentData` is not persisted. After locale switch, the user must click "Go to payment" again. This is acceptable — Stripe Elements need re-mounting and the client secret may expire.
- **Address references**: Persisting by ID and resolving on restore handles address list changes.
- **Stale data**: If cart changes significantly between locale switches, persisted addresses might not match. Clear persisted state when cart becomes empty.
- **SSR**: `sessionStorage` is client-only; guard all access with `typeof window !== 'undefined'`.

### Difficulty: Medium
- ~60-100 lines of code changes across 2 files
- No server changes, no new dependencies
- Main complexity: address resolution on restore, careful cleanup lifecycle

### Alternative considered: URL search params
Could persist email and address IDs in query params. But exposes PII in URLs and has length limits. sessionStorage is better.

### Out of scope
- Persisting across browser tabs (would need localStorage + cross-tab sync)
- Persisting across full browser refresh (sessionStorage already survives refresh; this is included)