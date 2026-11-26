# Plan: Populate customerEmail on orders for logged-in users

## Problem
In the admin panel, the `customerEmail` field on order details is empty for logged-in users but filled for guest orders. This is because the Stripe adapter sets `customer` (relationship to users) for logged-in orders but does NOT set `customerEmail`. Guest orders have `customerEmail` set directly.

## Solution
Add a `beforeChange` hook on the orders collection that populates `customerEmail` from the related user when `customer` is set but `customerEmail` is empty. This persists the email on the order so it displays in the admin panel and is available for queries.

## Hook design
```ts
export const populateOrderCustomerEmail: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (data.customerEmail) return data  // already set (guest order)
  if (!data.customer) return data     // no customer relationship

  const customerID = typeof data.customer === 'object' && data.customer !== null && 'id' in data.customer
    ? (data.customer as { id: string | number }).id
    : data.customer

  try {
    const user = await req.payload.findByID({
      collection: 'users',
      depth: 0,
      id: customerID as string | number,
      overrideAccess: true,
      req,
    }) as { email?: string | null }
    if (user?.email) {
      return { ...data, customerEmail: user.email }
    }
  } catch { /* ignore */ }

  return data
}
```

## Files to edit
- Create `src/hooks/populateOrderCustomerEmail.ts`
- `src/b2b/pluginOverrides.ts` — import and add to `beforeChange` array (line ~317)

## Validation
- Typecheck: `pnpm exec tsc --noEmit`
- Manual: Logged-in checkout → admin panel shows customer email on order details
- Manual: Guest checkout → still works (customerEmail already set, hook is no-op)