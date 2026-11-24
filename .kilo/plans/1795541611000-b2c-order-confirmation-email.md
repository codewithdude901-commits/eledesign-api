# Plan: Contextual address labels in B2B checkout

## Goal
In the B2B checkout page, the two "Add a new address" buttons (and their modals) should indicate whether they are for the billing or shipping address, so users don't confuse them.

## Root cause
`src/components/checkout/CheckoutAddresses.tsx`:
- The `CreateAddressModal` is rendered with default generic text ("Add a new address" / "Eine neue Adresse hinzufügen") in both the no-addresses branch and inside `AddressesModal`. The `heading` prop (e.g. "Billing address" / "Shipping address") is only rendered as an `<h3>` when addresses already exist, and is never passed to `CreateAddressModal`.
- In the no-addresses branch, no heading is rendered at all, so the button stands alone with no context.

## Files to edit
- `src/components/checkout/CheckoutAddresses.tsx`
- `src/components/business/BusinessCheckout.tsx`
- `src/components/checkout/CheckoutPage.tsx` (consistency for B2C)

## Changes

1. `CheckoutAddresses.tsx`:
   - Add optional prop `addressType?: 'billing' | 'shipping'`.
   - Derive `buttonText` and `modalTitle` from `addressType` + `locale`:
     - billing: de "Eine neue Rechnungsadresse hinzufügen" / en "Add a new billing address"
     - shipping: de "Eine neue Lieferadresse hinzufügen" / en "Add a new shipping address"
     - unset: de "Eine neue Adresse hinzufügen" / en "Add a new address" (current default)
   - Render the `heading` (as `<h3>`) in the no-addresses branch too, when provided.
   - Pass `buttonText` and `modalTitle` to every `CreateAddressModal` usage (no-addresses branch and inside `AddressesModal`).

2. `BusinessCheckout.tsx`:
   - Pass `addressType="billing"` to the billing `CheckoutAddresses` (line ~204).
   - Pass `addressType="shipping"` to the shipping `CheckoutAddresses` (line ~230).

3. `CheckoutPage.tsx`:
   - Pass `addressType="billing"` / `"shipping"` to the two `CheckoutAddresses` usages (lines ~281, ~334) for consistency.
   - For the guest `CreateAddressModal` usages (lines ~288, ~342), pass contextual `buttonText`/`modalTitle` (or `addressType` if `CreateAddressModal` is extended). Minimal: leave guest as generic, or extend `CreateAddressModal` with `addressType` too. Recommendation: extend `CreateAddressModal` with optional `addressType` mirroring the same logic, so guest flow also gets contextual labels.

## Risks / notes
- `CreateAddressModal` already accepts `buttonText` and `modalTitle`; no signature change needed if we only update `CheckoutAddresses`. Extending `CreateAddressModal` with `addressType` is optional but improves guest flow consistency.
- Keep defaults unchanged so other callers (if any) are unaffected.
- The `heading` prop remains the section title; `buttonText`/`modalTitle` become the action label. Both can coexist.

## Validation
- Typecheck: `pnpm exec tsc --noEmit`.
- Lint: `pnpm exec eslint src/components/checkout/CheckoutAddresses.tsx src/components/business/BusinessCheckout.tsx src/components/checkout/CheckoutPage.tsx src/components/addresses/CreateAddressModal.tsx`.
- Manual: open B2B checkout with no saved addresses → both sections show their heading above "Add a new … address" button; open each modal → title reflects billing/shipping. Repeat with saved addresses present. Verify B2C checkout still works.