# Plan: B2C order emails — confirmation on creation + status-change notifications

## Goal
1. Send a B2C order confirmation email when an order is created (fixes guest checkout, where status is `processing`, never `completed`).
2. Send a B2C email on every order status change made from the admin panel (processing/completed/cancelled/refunded).

## Root cause (creation email)
- `node_modules/@payloadcms/plugin-ecommerce/dist/payments/adapters/stripe/confirmOrder.js:71` creates orders with `status: 'processing'`.
- Current hook `src/b2c/hooks/orderHooks.ts:27` returns early unless `status === 'completed'`, so it never fires.
- Logged-in orders store `customer` (relationship ID) but no `customerEmail`, so `getRecipient` resolves null.

## Files to edit
- `src/b2c/hooks/orderHooks.ts`
- `src/b2c/emails/sendB2COrderConfirmation.ts` (add `sendB2COrderStatusUpdate`)

## Email functions (`sendB2COrderConfirmation.ts`)
Keep `sendB2COrderConfirmation` (rich confirmation: items, total, order link) for new orders.

Add `sendB2COrderStatusUpdate({ locale = 'de', status, order, payload })`:
- Recipient = `order.customerEmail` (already resolved by hook) → return early if none.
- Subject/content per status:
  - `completed`: "Your order has been completed" / "Ihre Bestellung wurde abgeschlossen" + order link.
  - `cancelled`: "Your order has been cancelled" / "Ihre Bestellung wurde storniert" + order link.
  - `refunded`: "Your order has been refunded" / "Ihre Bestellung wurde erstattet" + order link.
  - `processing`: "Your order is being processed" / "Ihre Bestellung wird bearbeitet" + order link.
- Wrap `payload.sendEmail` in try/catch + log (mirror existing `send` helper). Guard test env.
- Order link: `${serverURL}/orders/${id}?email=...&accessToken=...` (reuse `getOrderURL`).

## Hook (`orderHooks.ts`)
```ts
export const sendB2COrderConfirmationAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const order = doc as OrderData
  const previous = previousDoc as OrderData | undefined

  const channel = order.channel ?? 'b2c'
  if (channel !== 'b2c') return doc
  if (!order.id) return doc

  const payload = req.payload

  // Resolve recipient email (guest: customerEmail; logged-in: fetch customer)
  let customerEmail = order.customerEmail ?? null
  if (!customerEmail && order.customer) {
    const customerID = typeof order.customer === 'object' && order.customer !== null && 'id' in order.customer
      ? (order.customer as { id: string | number }).id
      : order.customer
    try {
      const user = await payload.findByID({ collection: 'users', depth: 0, id: customerID as string | number, overrideAccess: true, req }) as { email?: string | null }
      customerEmail = user?.email ?? null
    } catch { /* ignore */ }
  }
  if (!customerEmail) return doc

  const orderForEmail = { accessToken: order.accessToken, amount: order.amount, customerEmail, id: order.id, items: (order.items as never) ?? null }

  if (!previous) {
    // Newly created order → confirmation email
    void sendB2COrderConfirmation({ locale: 'de', order: orderForEmail, payload })
} else if (previous.status !== order.status) {
    // Status changed (admin panel or otherwise) → status update email
    void sendB2COrderStatusUpdate({ locale: 'de', order: orderForEmail, payload, status: order.status as 'completed' | 'processing' | 'cancelled' | 'refunded' })
  }

  return doc
}
```

Idempotency:
- Creation fires only when `!previous` → one email per order.
- Status-change fires only when `previous.status !== order.status` → no duplicate on re-save with same status.

## Risks / notes
- `void` fire-and-forget matches existing B2B pattern; errors logged inside `send`.
- Status values are `'processing' | 'completed' | 'cancelled' | 'refunded'` (OrderStatus type). Guard the cast.
- Locale: hardcoded to `'de'` for all B2C order emails (no preferred-language option in account settings). Consistent with the current B2C email implementation.
- The hook fires for admin-panel updates too (Payload triggers afterChange on update), covering "every order state change from admin panel."
- No changes to ConfirmOrder.tsx or checkout routes; delivery is centralized in the hook.

## Validation
- Typecheck: `pnpm exec tsc --noEmit` filtered for the edited files.
- Manual: guest checkout → confirmation email. Logged-in checkout → confirmation email to account email. Admin changes status processing→completed/cancelled/refunded → one status email per change. Re-saving same status → no duplicate. Check server logs for "Failed to send B2C email" on failure.