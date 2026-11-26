import type { CollectionAfterChangeHook } from 'payload'

import { sendB2COrderConfirmation, sendB2COrderStatusUpdate } from '@/b2c/emails/sendB2COrderConfirmation'

type OrderData = {
  accessToken?: null | string
  amount?: null | number
  channel?: 'b2b' | 'b2c' | null
  customer?: unknown
  customerEmail?: null | string
  locale?: null | string
  id?: number | string
  items?: unknown
  status?: null | string
}

export const sendB2COrderConfirmationAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const order = doc as unknown as OrderData
  const previous = previousDoc as unknown as OrderData | undefined

  const channel = order.channel ?? 'b2c'
  if (channel !== 'b2c') return doc

  if (!order.id) return doc

  const payload = req.payload

  // Detect locale: prefer cookie, then persisted order.locale, then Referer, then Accept-Language, default 'de'
  const headers = req.headers as { get?: (name: string) => string | null } | undefined
  let locale: 'de' | 'en' = 'de'
  const cookieHeader = headers?.get?.('cookie') || ''
  const match = cookieHeader.match(/(?:^|; )locale=(de|en)/)
  if (match) locale = match[1] as 'de' | 'en'
  else if (order.locale === 'en' || order.locale === 'de') locale = order.locale as 'de' | 'en'
  else {
    const referer = headers?.get?.('referer') || ''
    try {
      const path = new URL(referer).pathname
      if (path.startsWith('/en') || path.includes('/en/')) locale = 'en'
    } catch { /* ignore */ }
    if (locale === 'de') {
      const acceptLang = headers?.get?.('accept-language') || ''
      if (acceptLang.toLowerCase().startsWith('en')) locale = 'en'
    }
  }



  // Resolve recipient email (guest: customerEmail; logged-in: fetch customer)
  let customerEmail = order.customerEmail ?? null
  if (!customerEmail && order.customer) {
    const customerID = typeof order.customer === 'object' && order.customer !== null && 'id' in order.customer
      ? (order.customer as { id: string | number }).id
      : order.customer
    try {
      const user = await payload.findByID({
        collection: 'users',
        depth: 0,
        id: customerID as string | number,
        overrideAccess: true,
        req,
      }) as { email?: string | null }
      customerEmail = user?.email ?? null
    } catch { /* ignore */ }
  }
  if (!customerEmail) return doc

  const orderForEmail = {
    accessToken: order.accessToken,
    amount: order.amount,
    customerEmail,
    id: order.id,
    items: (order.items as never) ?? null,
  }

  if (!previous) {
    // Newly created order → confirmation email
    void sendB2COrderConfirmation({ locale, order: orderForEmail, payload })
  } else if (previous.status !== order.status) {
    // Status changed (admin panel or otherwise) → status update email
    void sendB2COrderStatusUpdate({
      locale,
      order: orderForEmail,
      payload,
      status: order.status as 'completed' | 'processing' | 'cancelled' | 'refunded',
    })
  }

  return doc
}