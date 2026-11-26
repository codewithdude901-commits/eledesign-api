# Plan: Fix English checkout flow — post-checkout page locale + email locale

## Problem 1: Post-checkout page displays in German after English checkout
In `src/components/checkout/ConfirmOrder.tsx` line 64, the redirect after order confirmation is:
```ts
router.push(`/orders/${result.orderID}?${queryParams.toString()}`)
```
This omits the locale prefix. Since there's no active middleware (proxy.ts is not wired as middleware.ts), the route `/orders/...` doesn't match `src/app/(app)/[locale]/(account)/orders/[id]/page.tsx`. The user needs the locale in the path.

**Fix:** Use `useParams()` from `next/navigation` to get the current `locale` and include it in the redirect URL:
```ts
const params = useParams()
const locale = params?.locale || 'de'
router.push(`/${locale}/orders/${result.orderID}?${queryParams.toString()}`)
```

## Problem 2: No email sent in English (always German)
In `src/b2c/hooks/orderHooks.ts`, the locale is hardcoded to `'de'`:
```ts
void sendB2COrderConfirmation({ locale: 'de', ... })
void sendB2COrderStatusUpdate({ locale: 'de', ... })
```

The hook needs to detect the locale from the request. Since `PayloadRequest extends Partial<Request>`, we can inspect `req.url` for the `/en/` segment:
```ts
const locale = (req.url || '').includes('/en/') ? 'en' : 'de'
```

Alternatively, use the `Accept-Language` header as a fallback.

## Files to edit
- `src/components/checkout/ConfirmOrder.tsx` — add locale to redirect URL
- `src/b2c/hooks/orderHooks.ts` — detect locale from req instead of hardcoding 'de'

## Validation
- Typecheck: `pnpm exec tsc --noEmit` filtered for modified files
- Manual: English checkout → confirmation page in English, email in English with `/en/orders/...` link
- Manual: German checkout → confirmation page in German, email in German with `/de/orders/...` link