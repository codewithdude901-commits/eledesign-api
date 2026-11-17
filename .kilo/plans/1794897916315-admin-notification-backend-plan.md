# Admin Notification Backend Plan

## 1. Confirmed context (from inspection, not assumptions)

- Stack: Payload `3.88.0`, Next `16.3.0`, MongoDB via `@payloadcms/db-mongodb`, TypeScript strict.
- **Orders slug is `orders`**. Confirmed in:
  - `node_modules/@payloadcms/plugin-ecommerce/dist/collections/orders/createOrdersCollection.js` (`slug: 'orders'`, `timestamps: true`).
  - `src/payload-types.ts` (`Config['collections'].orders`, `ecommerce.collections.orders`).
  - `src/plugins/index.ts` import/export config uses `slug: 'orders'`; B2B checkout creates `collection: 'orders'`.
  - B2C and B2B share the same collection. B2B is identified by `channel: 'b2b'` (`b2bOrdersCollectionOverride` in `src/b2b/pluginOverrides.ts`). No separate B2B orders collection exists.
- **BusinessApplications slug is `business-applications`** (`src/collections/BusinessApplications/index.ts:10`, generated types).
- **Admin auth**: `Users.slug = 'users'`; admin check is `checkRole(['admin'], user)` from `@/access/utilities`. Existing `adminOnly`, `isAdmin`, `adminOnlyFieldAccess` in `src/access/`.
- **Custom API convention**: Next route handlers under `src/app/(app)/api/...`, using `getPayload({ config: configPromise })` and `payload.auth({ headers })` (see `src/app/(app)/api/b2b/checkout/route.ts`). The generated Payload catch-all `(payload)/api/[...slug]` coexists with static `(app)/api/...` routes.
- **Singleton precedent**: `src/collections/Counters/index.ts` (unique `key`, admin-only, `admin.hidden: true`).
- **Frontend is out of scope**: `src/components/admin/NotificationBadges.tsx` currently uses `MOCK_NOTIFICATIONS`; do not modify it or `custom.scss`.
- `createdAt` is auto-added by Payload timestamps but is **not indexed** by the Mongo adapter. The task forbids modifying Orders/BusinessApplications schemas, so no index is added to those collections.

## 2. Design decisions

- New collection slug: **`admin-notification-state`**.
- Fields: `ordersLastSeenAt` (date), `applicationsLastSeenAt` (date), plus internal unique `key` (`'global'`) to make the document a singleton and to make initialization atomic.
- Initial value for missing timestamps: **current server time** (chosen). Existing historical records are treated as already seen; only records created after first access count as unread.
- Single global state document (one admin, no per-user state).
- Counts use Payload `count()` with `createdAt > lastSeen` (no full document reads).
- Acknowledgement captures **one server-generated `Date` at the start of the POST handler**, writes that exact value to only the requested field, and counts use strict `greater_than`. A record created after the cutoff remains unread.
- Do not touch ecommerce hooks, payment/checkout/B2B pricing, or the Orders/BusinessApplications schemas.
- No polling, WebSockets, or frontend changes.

## 3. Files

### Create

1. `src/collections/AdminNotificationState/index.ts`
2. `src/notifications/adminNotifications.ts`
3. `src/app/(app)/api/admin-notifications/route.ts`
4. `src/app/(app)/api/admin-notifications/acknowledge/route.ts`
5. `tests/int/admin-notifications.int.spec.ts`

### Modify

1. `src/payload.config.ts` — import and register the new collection.
2. `src/payload-types.ts` — regenerate with `pnpm generate:types` (do not hand-edit).

## 4. Collection: `admin-notification-state`

`src/collections/AdminNotificationState/index.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const ADMIN_NOTIFICATION_STATE_SLUG = 'admin-notification-state'
export const ADMIN_NOTIFICATION_STATE_KEY = 'global'

export const AdminNotificationState: CollectionConfig = {
  slug: ADMIN_NOTIFICATION_STATE_SLUG,
  access: {
    admin: adminOnly,
    create: () => false,   // only internal db.upsert creates it
    delete: () => false,   // singleton must never be deleted through the API
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: false,
    hidden: true,
  },
  hooks: {
    beforeValidate: [
      async ({ operation, req }) => {
        if (operation !== 'create') return
        const existing = await req.payload.find({
          collection: ADMIN_NOTIFICATION_STATE_SLUG,
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
        if (existing.totalDocs > 0) {
          throw new APIError('The admin notification state is a singleton document.', 400)
        }
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: ADMIN_NOTIFICATION_STATE_KEY,
      admin: { hidden: true },
    },
    { name: 'ordersLastSeenAt', type: 'date' },
    { name: 'applicationsLastSeenAt', type: 'date' },
  ],
}
```

Notes:
- `access.create: () => false` + `access.delete: () => false` + `admin.group: false` + `admin.hidden: true` keep the state out of the admin UI and prevent duplicate/deleted state through the normal API.
- Internal creation uses `payload.db.upsert`, which bypasses access control and hooks (intended here).
- The `beforeValidate` guard blocks any external `payload.create` once a state doc exists; `db.upsert` is unaffected.
- Do not add a hook to Orders/BusinessApplications.

## 5. Notification module

`src/notifications/adminNotifications.ts` — no `next/*` imports so it is directly testable. Suggested exports:

```ts
import type { Payload } from 'payload'
import { checkRole } from '@/access/utilities'
import {
  ADMIN_NOTIFICATION_STATE_KEY,
  ADMIN_NOTIFICATION_STATE_SLUG,
} from '@/collections/AdminNotificationState'

type AdminNotificationStateDoc = {
  id: string
  key?: string | null
  ordersLastSeenAt?: string | null
  applicationsLastSeenAt?: string | null
}

export type AdminNotificationCounts = {
  orders: number
  businessApplications: number
}

export type AcknowledgeCollection = 'orders' | 'business-applications'

export type HandlerResult = {
  status: number
  body: unknown
}
```

### `getOrCreateAdminNotificationState(payload, now = new Date())`

1. `findState(payload)` via `payload.find({ collection: ADMIN_NOTIFICATION_STATE_SLUG, depth: 0, limit: 1, overrideAccess: true })`.
2. If missing, atomically create with:
   ```ts
   await payload.db.upsert({
     collection: ADMIN_NOTIFICATION_STATE_SLUG,
     where: { key: { equals: ADMIN_NOTIFICATION_STATE_KEY } },
     data: {
       key: ADMIN_NOTIFICATION_STATE_KEY,
       ordersLastSeenAt: now.toISOString(),
       applicationsLastSeenAt: now.toISOString(),
     },
   })
   ```
   Then re-fetch. Throw a clear error if still missing.
3. If either timestamp is null/missing, patch only the missing fields with `now.toISOString()` using `payload.update({ ..., overrideAccess: true })`.
4. Return the state doc.

`db.upsert` is the concurrency-safe initialization: two callers race, Mongo applies one insert and one update on the same unique `key`; both then re-fetch the same document.

### `countAdminNotifications(payload)`

```ts
const state = await getOrCreateAdminNotificationState(payload)
const ordersLastSeenAt = state.ordersLastSeenAt ?? new Date(0).toISOString()
const applicationsLastSeenAt = state.applicationsLastSeenAt ?? new Date(0).toISOString()

const [orders, apps] = await Promise.all([
  payload.count({
    collection: 'orders',
    where: { createdAt: { greater_than: ordersLastSeenAt } },
    overrideAccess: true,
  }),
  payload.count({
    collection: 'business-applications',
    where: { createdAt: { greater_than: applicationsLastSeenAt } },
    overrideAccess: true,
  }),
])

return { orders: orders.totalDocs, businessApplications: apps.totalDocs }
```

- `createdAt` is server-generated by Payload; clients cannot spoof it.
- B2C and B2B orders are both in `orders`, so one count covers both.
- No per-order notification records are created.

### `acknowledgeAdminNotifications(payload, collection)`

```ts
const cutoff = new Date() // capture BEFORE any reads/writes
const state = await getOrCreateAdminNotificationState(payload, cutoff)
const data =
  collection === 'orders'
    ? { ordersLastSeenAt: cutoff.toISOString() }
    : { applicationsLastSeenAt: cutoff.toISOString() }

await payload.update({
  collection: ADMIN_NOTIFICATION_STATE_SLUG,
  id: state.id,
  data,
  depth: 0,
  overrideAccess: true,
})

return { success: true, collection, lastSeenAt: cutoff.toISOString() }
```

Concurrency rationale: capturing `cutoff` before the state read/write means any order/application created after that instant has `createdAt > cutoff` and remains unread. A slow request cannot acknowledge work that arrived during the request. Out-of-order concurrent acks can only move `lastSeen` backwards (more unread), never silently drop a new record.

### Auth + HTTP handlers (same file)

```ts
async function authenticateAdmin(payload: Payload, headers: Headers) {
  let user
  try {
    ;({ user } = await payload.auth({ headers }))
  } catch {
    return { error: { status: 401, body: { error: 'Unauthorized.' } } }
  }
  if (!user) return { error: { status: 401, body: { error: 'Unauthorized.' } } }
  if (!checkRole(['admin'], user)) {
    return { error: { status: 403, body: { error: 'Forbidden.' } } }
  }
  return { error: null }
}

export async function handleGetAdminNotifications(payload, headers): Promise<HandlerResult> {
  const auth = await authenticateAdmin(payload, headers)
  if (auth.error) return auth.error
  return { status: 200, body: await countAdminNotifications(payload) }
}

export async function handleAcknowledgeAdminNotifications(
  payload,
  headers,
  request: Request,
): Promise<HandlerResult> {
  const auth = await authenticateAdmin(payload, headers)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  const collection = (body as { collection?: unknown } | null)?.collection
  if (collection !== 'orders' && collection !== 'business-applications') {
    return { status: 400, body: { error: 'Invalid collection.' } }
  }

  return { status: 200, body: await acknowledgeAdminNotifications(payload, collection) }
}
```

- Never read `lastSeenAt`/`timestamp` from the client body.
- All `overrideAccess: true` calls happen only after the admin check.
- `payload.auth` uses `Authorization: Bearer <token>` (default `jwtOrder` includes `Bearer`), so no CSRF/cookie complexity.

## 6. Route handlers (thin Next wrappers)

`src/app/(app)/api/admin-notifications/route.ts`:

```ts
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { handleGetAdminNotifications } from '@/notifications/adminNotifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const { status, body } = await handleGetAdminNotifications(payload, await getHeaders())
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
```

`src/app/(app)/api/admin-notifications/acknowledge/route.ts`:

```ts
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { handleAcknowledgeAdminNotifications } from '@/notifications/adminNotifications'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { status, body } = await handleAcknowledgeAdminNotifications(
    payload,
    await getHeaders(),
    request,
  )
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
```

Static `(app)/api/admin-notifications` takes precedence over the dynamic `(payload)/api/[...slug]` catch-all, matching the existing `(app)/api/...` routes.

## 7. Register the collection

In `src/payload.config.ts`:

```ts
import { AdminNotificationState } from '@/collections/AdminNotificationState'
// ...
collections: [
  Users,
  Pages,
  Categories,
  Media,
  BusinessApplications,
  Counters,
  AdminNotificationState,
],
```

Then run `pnpm generate:types` before type-checking/tests.

## 8. Testing plan

Create `tests/int/admin-notifications.int.spec.ts` (vitest, `tests/int/**/*.int.spec.ts` is already included by `vitest.config.mts`). Use the real Payload/Mongo instance, `getPayload({ config })`, `overrideAccess: true`, and `as never` casts for `data` (same pattern as `tests/int/b2b-approval.int.spec.ts`).

Test setup:
- `beforeAll`: get payload; create a unique admin user (`roles: ['admin']`) and a unique customer user (`roles: ['customer']`); `payload.login` each; store `Authorization: Bearer <token>` headers.
- `beforeEach`: reset state to a known past timestamp via `payload.update` on the state doc (`ordersLastSeenAt`/`applicationsLastSeenAt` = now - 1h).
- `afterEach`: delete orders/applications created by the test (track IDs).
- `afterAll`: delete test users and state doc; also clean up by unique email as a fallback.

Helpers:
- `setLastSeen(payload, data)`.
- `createOrder(channel)` → `payload.create({ collection: 'orders', data: { amount: 1000, channel, currency: 'EUR', items: [], status: 'processing', ...(channel === 'b2b' ? { b2bStatus: 'awaiting_payment' } : {}) } as never, overrideAccess: true })`.
- `createApplication()` → `payload.create({ collection: 'business-applications', data: { companyName, contactName, email, termsAccepted: true } as never, overrideAccess: true })`.
- `count()` → `countAdminNotifications(payload)`.

Required cases:
1. **New B2C order increments order count**: capture before, create `channel: 'b2c'`, expect `orders` +1 and `businessApplications` unchanged.
2. **New B2B order increments order count**: same with `channel: 'b2b'`, `b2bStatus: 'awaiting_payment'`; expect `orders` +1.
3. **Existing order update does not increment**: create order, capture count, `payload.update` order `status`, expect unchanged.
4. **New application increments application count**: create application, expect `businessApplications` +1 and `orders` unchanged.
5. **Existing application update does not increment**: update `phone`/`message`, expect unchanged.
6. **Acknowledging Orders does not affect Applications**: create a known application, POST ack `orders`, expect applications count unchanged and orders count 0 (or not increased).
7. **Acknowledging Applications does not affect Orders**: create a known order, POST ack `business-applications`, expect orders unchanged and applications 0 (or not increased).
8. **Record created after acknowledgement remains unread**: reset baseline, ack `orders`, expect 0; create a new order; expect 1 (use before/after deltas to tolerate unrelated data).
9. **Unauthenticated requests rejected**: `handleGetAdminNotifications(payload, new Headers())` → 401; POST with empty headers → 401.
10. **Non-admin rejected**: customer token → 403 for GET.
11. **Invalid acknowledgement body**: POST `{ collection: 'nope' }` → 400; malformed JSON → 400.
12. **State document cannot be duplicated**: `payload.create` of a second state doc rejects; concurrent `Promise.all([getOrCreate(), getOrCreate()])` returns the same `id`; `payload.find` count is 1.
13. **Missing timestamps initialized safely**: set both timestamps to `null`, call `getOrCreate`, expect both non-null and close to now.

Call the handler functions directly (`handleGetAdminNotifications`, `handleAcknowledgeAdminNotifications`) rather than importing the Next route modules, so no `next/headers` mocking is needed. Construct `new Headers({ authorization: 'Bearer ...' })` and `new Request(url, { method: 'POST', body: JSON.stringify(...), headers: { 'content-type': 'application/json' } })`.

## 9. Validation commands

Run from the repo root:

```powershell
pnpm generate:types
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
```

- `pnpm generate:types` is required after adding the collection.
- `pnpm generate:importmap` is optional here (no new admin components); run it only if the import map changes.
- `pnpm test:int` requires the existing `.env` / MongoDB setup already used by `tests/int/api.int.spec.ts` and `tests/int/b2b-approval.int.spec.ts`.

## 10. Deliverables report (implementation agent must report)

- Files created and modified.
- Actual collection slugs used: `orders`, `business-applications`, `users`, `admin-notification-state`.
- Notification state structure: `{ id, key: 'global', ordersLastSeenAt, applicationsLastSeenAt, createdAt, updatedAt }`.
- Endpoint examples:

```http
GET /api/admin-notifications
Authorization: Bearer <admin-token>

200 { "orders": 0, "businessApplications": 0 }
```

```http
POST /api/admin-notifications/acknowledge
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "collection": "orders" }

200 { "success": true, "collection": "orders", "lastSeenAt": "2026-11-17T06:45:16.000Z" }
```

Error responses: `401 { "error": "Unauthorized." }`, `403 { "error": "Forbidden." }`, `400 { "error": "Invalid collection." }`.

- Authentication/access-control implementation summary.
- Test results (pass/fail per case).
- Commands run and their outcome.

## 11. Risks / notes

- `createdAt` is not indexed on `orders` / `business-applications`; counts use a range filter. This is acceptable at current volumes and avoids schema changes. If volume grows, adding an index would require modifying those collection configs (out of scope here).
- The acknowledgement uses strict `createdAt > lastSeen`. A record created in the same millisecond as the cutoff is treated as read; this is an acceptable millisecond-resolution edge case. Using `greater_than_or_equal` would risk re-counting a record acknowledged in the same millisecond.
- `payload.db.upsert` bypasses access control/hooks by design; it is only called after admin authentication, and the `beforeValidate` singleton guard prevents external duplicate creation.
- The state collection is hidden (`admin.group: false`, `admin.hidden: true`) but still accessible through the admin-authenticated API.

## 12. Out of scope

- Frontend badge wiring, polling, WebSockets, or any change to `NotificationBadges.tsx` / `custom.scss`.
- Orders/BusinessApplications schema or hook changes.
- Payment, checkout, B2B pricing, or ecommerce plugin changes.
- Per-user notification state, email/push notifications, or notification records per order.