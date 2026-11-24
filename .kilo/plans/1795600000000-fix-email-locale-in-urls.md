# Plan: Fix missing locale in email order URLs

## Problem
The `getOrderURL` function in `src/b2c/emails/sendB2COrderConfirmation.ts` generates URLs without the locale prefix (e.g., `/orders/123` instead of `/de/orders/123`), causing 404 errors when users click the "View order" link in emails.

The B2C order page is at `/[locale]/(account)/orders/[id]` which requires the locale prefix (e.g., `/de/orders/123` or `/en/orders/123`).

## Root Cause
The `getOrderURL` function (line 32-38) builds URLs as:
```ts
return `${serverURL}/orders/${order.id}?${params.toString()}`
```

Missing the locale prefix that Next.js i18n routing requires.

## Solution
Update `getOrderURL` to accept and use a `locale` parameter (defaulting to `'de'` as per existing B2C email convention):

```ts
const getOrderURL = (order: EmailOrder, email: string, locale: 'de' | 'en' = 'de'): string => {
  const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  const params = new URLSearchParams()
  if (email) params.set('email', email)
  if (order.accessToken) params.set('accessToken', order.accessToken)
  const localePrefix = locale === 'en' ? '/en' : ''
  return `${serverURL}${localePrefix}/orders/${order.id}?${params.toString()}`
}
```

Then update the two call sites:
1. Line 153 in `sendB2COrderStatusUpdate`: `getOrderURL(order, order.customerEmail)` → `getOrderURL(order, order.customerEmail, locale)`
2. Line 172 in `sendB2COrderConfirmation`: `getOrderURL(order, to)` → `getOrderURL(order, to, locale)`

## Verification
- Typecheck: `pnpm exec tsc --noEmit` on modified file
- Test: Trigger a B2C order email and verify the link includes `/de/` or `/en/` prefix