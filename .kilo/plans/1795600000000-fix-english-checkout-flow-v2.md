# Plan: Fix English checkout flow — locale detection and redirect

## Problem Analysis

### Root cause for email always German
The `afterChange` hook in `src/b2c/hooks/orderHooks.ts` detects locale from `req.url`, but the order is created via the API route `/api/payments/stripe/confirm-order`. The `req.url` is the API URL, not the page URL, so it never contains `/en/`. The locale is always `'de'`.

### Root cause for post-checkout page always German
`ConfirmOrder.tsx` uses `useParams()` to get the locale. But if the user navigates to `/checkout/confirm-order` (without locale prefix), `useParams()` returns no locale and falls back to `'de'`. Since there's no middleware wired (proxy.ts is not used as middleware.ts), the locale must be in the URL.

## Solution

### 1. Email locale: Detect from Accept-Language header
In `orderHooks.ts`, instead of checking `req.url` for `/en/`, check the `Accept-Language` header:
```ts
const acceptLang = req.headers?.get?.('accept-language') || ''
const locale = acceptLang.startsWith('en') ? 'en' : 'de'
```

### 2. Post-checkout redirect: Use Accept-Language or router locale
In `ConfirmOrder.tsx`, since `useParams()` may not have the locale, we can use `usePathname()` to check if the current path starts with `/en/`:
```ts
const pathname = usePathname()
const locale = pathname?.startsWith('/en') ? 'en' : 'de'
```

Alternatively, use `useRouter` from `next/navigation` which has `router.locale` in some Next.js versions.

## Files to edit
- `src/b2c/hooks/orderHooks.ts` — use Accept-Language header for locale detection
- `src/components/checkout/ConfirmOrder.tsx` — use usePathname() for locale detection

## Validation
- Typecheck: `pnpm exec tsc --noEmit`
- Manual: English browser (Accept-Language: en) → English email with /en/ links
- Manual: English checkout page → redirects to /en/orders/{id}