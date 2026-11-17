import 'dotenv/config'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import {
  acknowledgeAdminNotifications,
  countAdminNotifications,
  getOrCreateAdminNotificationState,
  handleAcknowledgeAdminNotifications,
  handleGetAdminNotifications,
} from '@/notifications/adminNotifications'

const STATE_SLUG = 'admin-notification-state' as never

let payload: Payload
let adminEmail: string
let customerEmail: string
let adminHeaders: Headers
let customerHeaders: Headers
let createdOrderIDs: (number | string)[] = []
let createdApplicationIDs: (number | string)[] = []

async function setLastSeen(data: { applicationsLastSeenAt?: string | null; ordersLastSeenAt?: string | null }) {
  const state = await getOrCreateAdminNotificationState(payload)
  await payload.update({
    collection: STATE_SLUG,
    id: state.id,
    data: data as never,
    depth: 0,
    overrideAccess: true,
  })
}

async function createOrder(channel: 'b2c' | 'b2b') {
  const order = await payload.create({
    collection: 'orders',
    data: {
      amount: 1000,
      channel,
      currency: 'EUR',
      items: [],
      status: 'processing',
      ...(channel === 'b2b' ? { b2bStatus: 'awaiting_payment' } : {}),
    } as never,
    overrideAccess: true,
  })
  createdOrderIDs.push(order.id)
  return order
}

async function createApplication() {
  const ts = Date.now() + Math.random()
  const app = await payload.create({
    collection: 'business-applications',
    data: {
      companyName: `Notif Test Co ${ts}`,
      contactName: 'Notif Tester',
      email: `notif-app-${ts}@example.com`,
      termsAccepted: true,
    } as never,
    overrideAccess: true,
  })
  createdApplicationIDs.push(app.id)
  return app
}

async function authHeaders(email: string, password: string): Promise<Headers> {
  const res = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  return new Headers({ authorization: `Bearer ${res.token}` })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const ts = Date.now()
  adminEmail = `notif-admin-${ts}@example.com`
  customerEmail = `notif-customer-${ts}@example.com`
  const password = 'TestPassword123!'

  await payload.create({
    collection: 'users',
    data: {
      email: adminEmail,
      password,
      roles: ['admin'],
    } as never,
    overrideAccess: true,
  })

  await payload.create({
    collection: 'users',
    data: {
      email: customerEmail,
      password,
      roles: ['customer'],
    } as never,
    overrideAccess: true,
  })

  adminHeaders = await authHeaders(adminEmail, password)
  customerHeaders = await authHeaders(customerEmail, password)
})

beforeEach(async () => {
  const past = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  await getOrCreateAdminNotificationState(payload)
  await setLastSeen({ ordersLastSeenAt: past, applicationsLastSeenAt: past })
  createdOrderIDs = []
  createdApplicationIDs = []
})

afterEach(async () => {
  for (const id of createdOrderIDs) {
    try {
      await payload.delete({ collection: 'orders', id, overrideAccess: true })
    } catch {}
  }
  for (const id of createdApplicationIDs) {
    try {
      await payload.delete({ collection: 'business-applications', id, overrideAccess: true })
    } catch {}
  }
})

afterAll(async () => {
  for (const email of [adminEmail, customerEmail]) {
    try {
      await payload.delete({
        collection: 'users',
        overrideAccess: true,
        where: { email: { equals: email } },
      })
    } catch {}
  }
  try {
    await payload.delete({
      collection: STATE_SLUG,
      overrideAccess: true,
      where: { key: { equals: 'global' } },
    })
  } catch {}
})

describe('admin notifications', () => {
  it('1. new B2C order increments order count', async () => {
    const before = await countAdminNotifications(payload)
    await createOrder('b2c')
    const after = await countAdminNotifications(payload)
    expect(after.orders).toBe(before.orders + 1)
    expect(after.businessApplications).toBe(before.businessApplications)
  })

  it('2. new B2B order increments order count', async () => {
    const before = await countAdminNotifications(payload)
    await createOrder('b2b')
    const after = await countAdminNotifications(payload)
    expect(after.orders).toBe(before.orders + 1)
    expect(after.businessApplications).toBe(before.businessApplications)
  })

  it('3. existing order update does not increment', async () => {
    const order = await createOrder('b2c')
    const before = await countAdminNotifications(payload)
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { status: 'completed' } as never,
      overrideAccess: true,
    })
    const after = await countAdminNotifications(payload)
    expect(after.orders).toBe(before.orders)
  })

  it('4. new application increments application count', async () => {
    const before = await countAdminNotifications(payload)
    await createApplication()
    const after = await countAdminNotifications(payload)
    expect(after.businessApplications).toBe(before.businessApplications + 1)
    expect(after.orders).toBe(before.orders)
  })

  it('5. existing application update does not increment', async () => {
    const app = await createApplication()
    const before = await countAdminNotifications(payload)
    await payload.update({
      collection: 'business-applications',
      id: app.id,
      data: { phone: '12345', message: 'updated' } as never,
      overrideAccess: true,
    })
    const after = await countAdminNotifications(payload)
    expect(after.businessApplications).toBe(before.businessApplications)
  })

  it('6. acknowledging Orders does not affect Applications', async () => {
    await createOrder('b2c')
    await createApplication()
    const before = await countAdminNotifications(payload)
    expect(before.orders).toBeGreaterThan(0)
    expect(before.businessApplications).toBeGreaterThan(0)

    const req = new Request('http://localhost/api/admin-notifications/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ collection: 'orders' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await handleAcknowledgeAdminNotifications(payload, adminHeaders, req)
    expect(res.status).toBe(200)
    const after = await countAdminNotifications(payload)
    expect(after.orders).toBe(0)
    expect(after.businessApplications).toBe(before.businessApplications)
  })

  it('7. acknowledging Applications does not affect Orders', async () => {
    await createOrder('b2c')
    await createApplication()
    const before = await countAdminNotifications(payload)
    expect(before.orders).toBeGreaterThan(0)
    expect(before.businessApplications).toBeGreaterThan(0)

    const req = new Request('http://localhost/api/admin-notifications/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ collection: 'business-applications' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await handleAcknowledgeAdminNotifications(payload, adminHeaders, req)
    expect(res.status).toBe(200)
    const after = await countAdminNotifications(payload)
    expect(after.businessApplications).toBe(0)
    expect(after.orders).toBe(before.orders)
  })

  it('8. record created after acknowledgement remains unread', async () => {
    const ackReq = new Request('http://localhost/api/admin-notifications/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ collection: 'orders' }),
      headers: { 'content-type': 'application/json' },
    })
    await handleAcknowledgeAdminNotifications(payload, adminHeaders, ackReq)
    const zero = await countAdminNotifications(payload)
    expect(zero.orders).toBe(0)

    const before = await countAdminNotifications(payload)
    await createOrder('b2c')
    const after = await countAdminNotifications(payload)
    expect(after.orders).toBe(before.orders + 1)
  })

  it('9. unauthenticated requests rejected', async () => {
    const getRes = await handleGetAdminNotifications(payload, new Headers())
    expect(getRes.status).toBe(401)
    const postReq = new Request('http://localhost/api/admin-notifications/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ collection: 'orders' }),
      headers: { 'content-type': 'application/json' },
    })
    const postRes = await handleAcknowledgeAdminNotifications(payload, new Headers(), postReq)
    expect(postRes.status).toBe(401)
  })

  it('10. non-admin rejected', async () => {
    const res = await handleGetAdminNotifications(payload, customerHeaders)
    expect(res.status).toBe(403)
  })

  it('11. invalid acknowledgement body', async () => {
    const badReq = new Request('http://localhost/api/admin-notifications/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ collection: 'nope' }),
      headers: { 'content-type': 'application/json' },
    })
    const badRes = await handleAcknowledgeAdminNotifications(payload, adminHeaders, badReq)
    expect(badRes.status).toBe(400)

    const malformedReq = new Request('http://localhost/api/admin-notifications/acknowledge', {
      method: 'POST',
      body: '{bad json',
      headers: { 'content-type': 'application/json' },
    })
    const malformedRes = await handleAcknowledgeAdminNotifications(payload, adminHeaders, malformedReq)
    expect(malformedRes.status).toBe(400)
  })

  it('12. state document cannot be duplicated', async () => {
    await expect(
      payload.create({
        collection: STATE_SLUG,
        data: { key: 'global' } as never,
        overrideAccess: true,
      }),
    ).rejects.toThrow()

    const [a, b] = await Promise.all([
      getOrCreateAdminNotificationState(payload),
      getOrCreateAdminNotificationState(payload),
    ])
    expect(a.id).toBe(b.id)

    const found = await payload.find({ collection: STATE_SLUG, limit: 10, overrideAccess: true })
    expect(found.totalDocs).toBe(1)
  })

  it('13. missing timestamps initialized safely', async () => {
    const state = await getOrCreateAdminNotificationState(payload)
    await payload.update({
      collection: STATE_SLUG,
      id: state.id,
      data: { ordersLastSeenAt: null, applicationsLastSeenAt: null } as never,
      depth: 0,
      overrideAccess: true,
    })

    const before = Date.now()
    const fixed = await getOrCreateAdminNotificationState(payload)
    const after = Date.now()

    expect(fixed.ordersLastSeenAt).toBeTruthy()
    expect(fixed.applicationsLastSeenAt).toBeTruthy()
    const ordersTs = new Date(fixed.ordersLastSeenAt as string).getTime()
    const appsTs = new Date(fixed.applicationsLastSeenAt as string).getTime()
    expect(ordersTs).toBeGreaterThanOrEqual(before - 1000)
    expect(ordersTs).toBeLessThanOrEqual(after + 1000)
    expect(appsTs).toBeGreaterThanOrEqual(before - 1000)
    expect(appsTs).toBeLessThanOrEqual(after + 1000)
  })

  it('GET handler returns counts and direct acknowledge works', async () => {
    await createOrder('b2c')
    await createApplication()
    const res = await handleGetAdminNotifications(payload, adminHeaders)
    expect(res.status).toBe(200)
    const body = res.body as { orders: number; businessApplications: number }
    expect(body.orders).toBeGreaterThan(0)
    expect(body.businessApplications).toBeGreaterThan(0)

    await acknowledgeAdminNotifications(payload, 'orders')
    const after = await countAdminNotifications(payload)
    expect(after.orders).toBe(0)
  })
})
