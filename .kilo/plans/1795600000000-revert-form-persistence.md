# Plan: Revert checkout form data persistence

## Goal
Remove all sessionStorage-based form data persistence that was added to the B2C checkout flow, restoring the original behavior where form state is lost on locale switch.

## Changes to revert

### 1. `src/components/checkout/CheckoutPage.tsx`
- Revert state initializers to original (no persisted state):
  - `email` → `useState('')`
  - `emailEditable` → `useState(true)`
  - `billingAddressSameAsShipping` → `useState(true)`
- Remove `STORAGE_KEY`, `PersistedCheckoutState` type, `readPersistedState` function, `persisted` variable
- Remove address resolution useEffect (persisted address by ID)
- Remove sessionStorage write useEffect
- Remove sessionStorage clear on cart empty useEffect
- Restore original cleanup useEffect that resets state on unmount:
  ```ts
  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])
  ```
- Restore original address prefill useEffect:
  ```ts
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])
  ```

### 2. `src/components/forms/CheckoutForm/index.tsx`
- Revert `termsAccepted` to `useState(false)` (remove sessionStorage read)
- Remove the sessionStorage write useEffect for termsAccepted
- Remove sessionStorage cleanup in the success path (keep `clearCart()` and `router.push()`)

### 3. `src/components/checkout/ConfirmOrder.tsx`
- Remove sessionStorage cleanup (keep `clearCart()` and `window.location.href` redirect)

## Files to edit
- `src/components/checkout/CheckoutPage.tsx`
- `src/components/forms/CheckoutForm/index.tsx`
- `src/components/checkout/ConfirmOrder.tsx`

## Validation
- Typecheck: `pnpm exec tsc --noEmit`
- Manual: Checkout form data resets on locale switch (original behavior restored)
- Manual: No sessionStorage references remain in checkout components