import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'

import {
  sendB2BOrderCancelled,
  sendB2BPaymentReceived,
} from '@/b2b/emails/sendOrderEmails'

type OrderItem = {
  product?: unknown
  quantity?: null | number
  variant?: unknown
}

type OrderData = {
  b2bStatus?: null | string
  channel?: 'b2b' | 'b2c' | null
  companySnapshot?: {
    preferredLocale?: 'de' | 'en' | null
  } | null
  id?: number | string
  inventoryRestored?: boolean | null
  invoice?: {
    paidAt?: null | string
    paidBy?: unknown
  } | null
  items?: null | OrderItem[]
  status?: null | string
  transactions?: null | unknown[]
}

const getID = (value: unknown): null | string => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }

  return null
}

export const setB2BOrderStatus: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  const order = data as OrderData
  if (order.channel !== 'b2b') return data

  const previous = originalDoc as unknown as OrderData | undefined
  const next: OrderData = { ...order }

  // The plugin exposes its own `status` field alongside `b2bStatus`.
  // Keep them aligned so an admin editing either field updates the portal.
  if (next.status === 'completed' && next.b2bStatus !== 'completed') {
    next.b2bStatus = 'completed'
  }

  if (next.status === 'cancelled' && next.b2bStatus !== 'cancelled') {
    next.b2bStatus = 'cancelled'
  }

  if (next.b2bStatus === 'completed' && next.status !== 'completed') {
    next.status = 'completed'
  }

  if (next.b2bStatus === 'cancelled' && next.status !== 'cancelled') {
    next.status = 'cancelled'
  }

  if (
    next.invoice?.paidAt &&
    !previous?.invoice?.paidAt &&
    (!next.b2bStatus || next.b2bStatus === 'awaiting_payment')
  ) {
    next.b2bStatus = 'paid'
  }

  if (
    next.b2bStatus === 'paid' &&
    previous?.b2bStatus !== 'paid' &&
    !next.invoice?.paidAt
  ) {
    next.invoice = {
      ...(next.invoice || {}),
      paidAt: new Date().toISOString(),
    }
  }

  const restockableStatuses = ['awaiting_payment', 'paid', 'processing']
  const wasRestockable = restockableStatuses.includes(previous?.b2bStatus || '')

  if (
    next.b2bStatus === 'cancelled' &&
    previous?.b2bStatus !== 'cancelled' &&
    wasRestockable &&
    !next.inventoryRestored
  ) {
    next.inventoryRestored = true

    if (!req.context) {
      req.context = {}
    }

    req.context.b2bRestockItems = next.items || []
    req.context.b2bCancelTransactions = next.transactions || []
  }

  return next
}

export const syncB2BOrderAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const order = doc as unknown as OrderData
  const previous = previousDoc as unknown as OrderData | undefined

  if (order.channel !== 'b2b') return doc

  const payload = req.payload
  const locale = order.companySnapshot?.preferredLocale || 'de'

  if (order.b2bStatus === 'paid' && previous?.b2bStatus !== 'paid') {
    for (const transaction of order.transactions || []) {
      const transactionID = getID(transaction)
      if (!transactionID) continue

      try {
        await payload.update({
          collection: 'transactions',
          data: { status: 'succeeded' },
          id: transactionID,
          overrideAccess: true,
          req,
        })
      } catch (error) {
        payload.logger.error({ err: error, msg: 'Failed to mark B2B transaction as succeeded' })
      }
    }

    if (!order.invoice?.paidBy && req.user?.id && order.id) {
      try {
        await payload.update({
          collection: 'orders',
          data: {
            invoice: {
              ...(order.invoice || {}),
              paidBy: req.user.id,
            },
          } as never,
          id: order.id,
          overrideAccess: true,
          req,
        })
      } catch (error) {
        payload.logger.error({ err: error, msg: 'Failed to record B2B invoice payer' })
      }
    }

    await sendB2BPaymentReceived({
      locale,
      order: order as never,
      payload,
    })
  }

  const restockItems = req.context?.b2bRestockItems as OrderItem[] | undefined

  if (Array.isArray(restockItems) && restockItems.length > 0) {
    for (const item of restockItems) {
      const quantity = Math.max(0, Number(item.quantity) || 0)
      if (!quantity) continue

      const productID = getID(item.product)
      const variantID = getID(item.variant)

      try {
        if (variantID) {
          await payload.db.updateOne({
            collection: 'variants',
            data: { inventory: { $inc: quantity } },
            id: variantID,
          })
        } else if (productID) {
          await payload.db.updateOne({
            collection: 'products',
            data: { inventory: { $inc: quantity } },
            id: productID,
          })
        }
      } catch (error) {
        payload.logger.error({ err: error, msg: 'Failed to restore B2B order inventory' })
      }
    }

    const cancelTransactions = req.context?.b2bCancelTransactions as unknown[] | undefined

    for (const transaction of cancelTransactions || []) {
      const transactionID = getID(transaction)
      if (!transactionID) continue

      try {
        await payload.update({
          collection: 'transactions',
          data: { status: 'cancelled' },
          id: transactionID,
          overrideAccess: true,
          req,
        })
      } catch (error) {
        payload.logger.error({ err: error, msg: 'Failed to cancel B2B transaction' })
      }
    }

    await sendB2BOrderCancelled({
      locale,
      order: order as never,
      payload,
    })
  }

  return doc
}
