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

function isWriteConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as {
    code?: unknown
    codeName?: unknown
    errorLabels?: unknown
    errorResponse?: { errorLabels?: unknown }
  }
  if (err.code === 112 || err.codeName === 'WriteConflict') return true
  const labels = [
    ...(Array.isArray(err.errorLabels) ? err.errorLabels : []),
    ...(Array.isArray(err.errorResponse?.errorLabels) ? err.errorResponse.errorLabels : []),
  ]
  return labels.includes('TransientTransactionError')
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function withWriteConflictRetry<T>(operation: () => Promise<T>, attempts = 5): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isWriteConflict(error) || attempt === attempts - 1) throw error
      await sleep(25 * (attempt + 1))
    }
  }
  throw lastError
}

async function findState(payload: Payload): Promise<AdminNotificationStateDoc | undefined> {
  const found = await payload.find({
    collection: ADMIN_NOTIFICATION_STATE_SLUG as never,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return found.docs[0] as AdminNotificationStateDoc | undefined
}

export async function getOrCreateAdminNotificationState(
  payload: Payload,
  now: Date = new Date(),
): Promise<AdminNotificationStateDoc> {
  let state = await findState(payload)
  if (!state) {
    await payload.db.upsert({
      collection: ADMIN_NOTIFICATION_STATE_SLUG,
      data: {
        key: ADMIN_NOTIFICATION_STATE_KEY,
        ordersLastSeenAt: now.toISOString(),
        applicationsLastSeenAt: now.toISOString(),
      },
      where: { key: { equals: ADMIN_NOTIFICATION_STATE_KEY } },
    })
    state = await findState(payload)
  }

  if (!state) {
    throw new Error('Failed to initialize admin notification state.')
  }

  const missing: { applicationsLastSeenAt?: string; ordersLastSeenAt?: string } = {}
  if (!state.ordersLastSeenAt) missing.ordersLastSeenAt = now.toISOString()
  if (!state.applicationsLastSeenAt) missing.applicationsLastSeenAt = now.toISOString()

  if (Object.keys(missing).length > 0) {
    const stateId = state.id
    state = (await withWriteConflictRetry(() =>
      payload.update({
        collection: ADMIN_NOTIFICATION_STATE_SLUG as never,
        id: stateId,
        data: missing as never,
        depth: 0,
        overrideAccess: true,
      }),
    )) as unknown as AdminNotificationStateDoc
  }

  return state
}

export async function countAdminNotifications(payload: Payload): Promise<AdminNotificationCounts> {
  const state = await getOrCreateAdminNotificationState(payload)
  const ordersLastSeenAt = state.ordersLastSeenAt ?? new Date(0).toISOString()
  const applicationsLastSeenAt = state.applicationsLastSeenAt ?? new Date(0).toISOString()

  const [orders, applications] = await Promise.all([
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

  return {
    orders: orders.totalDocs,
    businessApplications: applications.totalDocs,
  }
}

export async function acknowledgeAdminNotifications(
  payload: Payload,
  collection: AcknowledgeCollection,
) {
  const cutoff = new Date()
  const state = await getOrCreateAdminNotificationState(payload, cutoff)
  const data =
    collection === 'orders'
      ? { ordersLastSeenAt: cutoff.toISOString() }
      : { applicationsLastSeenAt: cutoff.toISOString() }

  await withWriteConflictRetry(() =>
    payload.update({
      collection: ADMIN_NOTIFICATION_STATE_SLUG as never,
      id: state.id,
      data: data as never,
      depth: 0,
      overrideAccess: true,
    }),
  )

  return { success: true, collection, lastSeenAt: cutoff.toISOString() }
}

async function authenticateAdmin(payload: Payload, headers: Headers) {
  let user
  try {
    ;({ user } = await payload.auth({ headers }))
  } catch {
    return { error: { status: 401, body: { error: 'Unauthorized.' } } }
  }
  if (!user) return { error: { status: 401, body: { error: 'Unauthorized.' } } }
  if (!checkRole(['admin'], user as never)) {
    return { error: { status: 403, body: { error: 'Forbidden.' } } }
  }
  return { error: null }
}

export async function handleGetAdminNotifications(
  payload: Payload,
  headers: Headers,
): Promise<HandlerResult> {
  const auth = await authenticateAdmin(payload, headers)
  if (auth.error) return auth.error
  return { status: 200, body: await countAdminNotifications(payload) }
}

export async function handleAcknowledgeAdminNotifications(
  payload: Payload,
  headers: Headers,
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
