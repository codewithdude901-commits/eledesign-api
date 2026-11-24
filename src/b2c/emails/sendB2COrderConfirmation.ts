import type { Payload } from 'payload'

type EmailOrderItem = {
  lineTotal?: null | number
  product?: unknown
  product_name?: null | string
  quantity?: null | number
  unitPrice?: null | number
}

export type EmailOrder = {
  accessToken?: null | string
  amount?: null | number
  customer?: unknown
  customerEmail?: null | string
  currency?: null | string
  id: number | string
  items?: EmailOrderItem[] | null
  status?: null | string
}

const getProductName = (item: EmailOrderItem): string => {
  if (item.product_name) return item.product_name
  if (item.product && typeof item.product === 'object' && 'title' in item.product) {
    const title = (item.product as { title?: unknown }).title
    if (typeof title === 'string') return title
  }

  return 'Product'
}

const getOrderURL = (order: EmailOrder, email: string, locale: 'de' | 'en' = 'de'): string => {
  const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  const params = new URLSearchParams()
  if (email) params.set('email', email)
  if (order.accessToken) params.set('accessToken', order.accessToken)
  const localePrefix = locale === 'en' ? '/en' : ''
  return `${serverURL}${localePrefix}/orders/${order.id}?${params.toString()}`
}

const getRecipient = (order: EmailOrder): string | null => {
  if (order.customerEmail) return order.customerEmail
  if (order.customer && typeof order.customer === 'object' && 'email' in order.customer) {
    const email = (order.customer as { email?: unknown }).email
    if (typeof email === 'string' && email) return email
  }

  return null
}

const itemsTable = (order: EmailOrder): string => {
  const rows = (order.items || [])
    .map(
      (item) =>
        `<tr><td>${getProductName(item)}</td><td>${item.quantity ?? 1}</td><td>${(
          (item.unitPrice ?? 0) / 100
        ).toFixed(2)} €</td><td>${((item.lineTotal ?? 0) / 100).toFixed(2)} €</td></tr>`,
    )
    .join('')

  return `<table cellpadding="6" cellspacing="0" border="1"><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line total</th></tr></thead><tbody>${rows}</tbody></table>`
}

const send = async ({
  html,
  payload,
  subject,
  to,
}: {
  html: string
  payload: Payload
  subject: string
  to: string
}) => {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) return

  try {
    await payload.sendEmail({
      html,
      subject,
      to,
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: `Failed to send B2C email: ${subject}` })
  }
}

type OrderStatus = 'processing' | 'completed' | 'cancelled' | 'refunded'

const getStatusSubject = (locale: 'de' | 'en', status: OrderStatus, orderId: number | string): string => {
  const subjects = {
    processing: {
      de: `Ihre Bestellung #${orderId} wird bearbeitet`,
      en: `Your order #${orderId} is being processed`,
    },
    completed: {
      de: `Ihre Bestellung #${orderId} wurde abgeschlossen`,
      en: `Your order #${orderId} has been completed`,
    },
    cancelled: {
      de: `Ihre Bestellung #${orderId} wurde storniert`,
      en: `Your order #${orderId} has been cancelled`,
    },
    refunded: {
      de: `Ihre Bestellung #${orderId} wurde erstattet`,
      en: `Your order #${orderId} has been refunded`,
    },
  }

  return subjects[status][locale]
}

const getStatusHtml = (locale: 'de' | 'en', status: OrderStatus, order: EmailOrder, orderURL: string): string => {
  const texts = {
    processing: {
      de: 'Ihre Bestellung wird derzeit bearbeitet.',
      en: 'Your order is currently being processed.',
    },
    completed: {
      de: 'Ihre Bestellung wurde erfolgreich abgeschlossen.',
      en: 'Your order has been successfully completed.',
    },
    cancelled: {
      de: 'Ihre Bestellung wurde storniert.',
      en: 'Your order has been cancelled.',
    },
    refunded: {
      de: 'Ihre Bestellung wurde erstattet.',
      en: 'Your order has been refunded.',
    },
  }

  const viewText = locale === 'en' ? 'View your order' : 'Bestellung ansehen'
  const fallbackText = locale === 'en' ? 'If the link does not work, open:' : 'Falls der Link nicht funktioniert, öffnen Sie:'

  return locale === 'en'
    ? `<h2>Order Update #${order.id}</h2><p>${texts[status].en}</p><p><a href="${orderURL}">${viewText}</a></p><p>${fallbackText} ${orderURL}</p>`
    : `<h2>Bestellupdate #${order.id}</h2><p>${texts[status].de}</p><p><a href="${orderURL}">${viewText}</a></p><p>${fallbackText} ${orderURL}</p>`
}

export const sendB2COrderStatusUpdate = async ({
  locale = 'de',
  order,
  payload,
  status,
}: {
  locale?: 'de' | 'en'
  order: EmailOrder
  payload: Payload
  status: OrderStatus
}): Promise<void> => {
  if (!order.customerEmail) return

  const orderURL = getOrderURL(order, order.customerEmail, locale)
  const subject = getStatusSubject(locale, status, order.id)
  const html = getStatusHtml(locale, status, order, orderURL)

  await send({ html, payload, subject, to: order.customerEmail })
}

export const sendB2COrderConfirmation = async ({
  locale = 'de',
  order,
  payload,
}: {
  locale?: 'de' | 'en'
  order: EmailOrder
  payload: Payload
}): Promise<void> => {
  const to = getRecipient(order)
  if (!to) return

  const orderURL = getOrderURL(order, to, locale)

  const total =
    typeof order.amount === 'number' ? (order.amount / 100).toFixed(2) : ''

  const subject =
    locale === 'en'
      ? `Order confirmation #${order.id}`
      : `Bestellbestätigung #${order.id}`

  const html =
    locale === 'en'
      ? `<h2>Thank you for your order</h2><p>Order: <strong>#${order.id}</strong></p>${itemsTable(order)}<p><strong>Total: ${total} €</strong></p><p><a href="${orderURL}">View your order</a></p><p>If the link does not work, open: ${orderURL}</p>`
      : `<h2>Vielen Dank für Ihre Bestellung</h2><p>Bestellung: <strong>#${order.id}</strong></p>${itemsTable(order)}<p><strong>Gesamt: ${total} €</strong></p><p><a href="${orderURL}">Bestellung ansehen</a></p><p>Falls der Link nicht funktioniert, öffnen Sie: ${orderURL}</p>`

  await send({ html, payload, subject, to })
}