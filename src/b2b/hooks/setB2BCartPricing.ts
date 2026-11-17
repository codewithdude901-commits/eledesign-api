import crypto from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'

import { isApprovedB2BUser } from '@/access/b2b'
import { checkRole } from '@/access/utilities'
import { priceCartItems, type PriceableCartItem } from '@/b2b/utilities/priceCartItems'
import { getProductID } from '@/b2b/utilities/pricing'

type CartData = {
  channel?: 'b2b' | 'b2c' | null
  customer?: unknown
  items?: PriceableCartItem[] | null
  secret?: null | string
  subtotal?: null | number
}

const getDiscountPercent = (user: unknown): number => {
  if (!user || typeof user !== 'object') return 0
  const b2b = (user as { b2b?: { discountPercent?: null | number } }).b2b
  return Math.min(Math.max(b2b?.discountPercent ?? 0, 0), 100)
}

export const setB2BCartPricing: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const cartData = data as CartData
  const previousCart = originalDoc as unknown as CartData | undefined
  const isAdmin = checkRole(['admin'], req.user)
  const approvedB2B = isApprovedB2BUser(req.user)
  const existingChannel = previousCart?.channel
  const incomingItems = Array.isArray(cartData.items)
    ? cartData.items
    : previousCart?.items
  const channel: 'b2b' | 'b2c' = isAdmin
    ? existingChannel || cartData.channel || 'b2c'
    : approvedB2B
      ? 'b2b'
      : 'b2c'
  const nextData: CartData = {
    ...cartData,
    channel,
  }

  if (req.user?.id && !isAdmin) {
    nextData.customer = req.user.id
  } else if (operation === 'create' && !nextData.customer && !nextData.secret) {
    const secret = crypto.randomBytes(20).toString('hex')
    nextData.secret = secret

    if (!req.context) {
      req.context = {}
    }

    req.context.newCartSecret = secret
  }

  let discountPercent = getDiscountPercent(req.user)

  if (isAdmin && channel === 'b2b') {
    const customerID = getProductID(nextData.customer)

    if (customerID) {
      try {
        const customer = await req.payload.findByID({
          collection: 'users',
          depth: 0,
          id: customerID,
          overrideAccess: true,
        })

        discountPercent = getDiscountPercent(customer)
      } catch {
        discountPercent = 0
      }
    }
  }

  const items = Array.isArray(incomingItems) ? incomingItems : []
  const priced = await priceCartItems({
    channel,
    discountPercent,
    items,
    payload: req.payload,
  })

  nextData.items = priced.items
  nextData.subtotal = priced.subtotal

  return nextData
}
