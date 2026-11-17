import type { Payload } from 'payload'

import { formatEuro } from '@/b2b/utilities/pricing'

type EmailOrderItem = {
  lineTotal?: null | number
  product?: unknown
  product_name?: null | string
  quantity?: null | number
  unitPrice?: null | number
}

export type EmailOrder = {
  amount?: null | number
  b2bStatus?: null | string
  companySnapshot?: {
    companyName?: null | string
    contactName?: null | string
    email?: null | string
    preferredLocale?: 'de' | 'en' | null
    vatId?: null | string
  } | null
  customerEmail?: null | string
  id: number | string
  invoice?: {
    bankAccountHolder?: null | string
    bankName?: null | string
    bic?: null | string
    dueDate?: null | string
    grossAmount?: null | number
    iban?: null | string
    invoiceNumber?: null | string
    netAmount?: null | number
    paidAt?: null | string
    paymentReference?: null | string
    vatAmount?: null | number
  } | null
  items?: EmailOrderItem[] | null
}

const getProductName = (item: EmailOrderItem): string => {
  if (item.product_name) return item.product_name
  if (item.product && typeof item.product === 'object' && 'title' in item.product) {
    const title = (item.product as { title?: unknown }).title
    if (typeof title === 'string') return title
  }

  return 'Product'
}

const getOrderURL = (order: EmailOrder, locale: 'de' | 'en'): string => {
  const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  return locale === 'en'
    ? `${serverURL}/en/business/orders/${order.id}`
    : `${serverURL}/business/orders/${order.id}`
}

const getRecipient = (order: EmailOrder): string | null =>
  order.customerEmail || order.companySnapshot?.email || null

const itemsTable = (order: EmailOrder): string => {
  const rows = (order.items || [])
    .map(
      (item) =>
        `<tr><td>${getProductName(item)}</td><td>${item.quantity ?? 1}</td><td>${formatEuro(
          item.unitPrice ?? 0,
        )}</td><td>${formatEuro(item.lineTotal ?? 0)}</td></tr>`,
    )
    .join('')

  return `<table cellpadding="6" cellspacing="0" border="1"><thead><tr><th>Item</th><th>Qty</th><th>Unit (net)</th><th>Line total</th></tr></thead><tbody>${rows}</tbody></table>`
}

const totals = (order: EmailOrder): string =>
  `<p>Net: ${formatEuro(order.invoice?.netAmount ?? 0)}<br/>VAT: ${formatEuro(
    order.invoice?.vatAmount ?? 0,
  )}<br/><strong>Total: ${formatEuro(order.invoice?.grossAmount ?? order.amount ?? 0)}</strong></p>`

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
  try {
    await payload.sendEmail({
      html,
      subject,
      to,
    })
  } catch (error) {
    payload.logger.error({ err: error, msg: `Failed to send B2B email: ${subject}` })
  }
}

export const sendB2BOrderConfirmation = async ({
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

  const invoice = order.invoice
  const subject =
    locale === 'en'
      ? `Order ${invoice?.invoiceNumber || order.id} received`
      : `Bestellung ${invoice?.invoiceNumber || order.id} eingegangen`

  const paymentDetails =
    locale === 'en'
      ? `<p>Please transfer the total amount using the invoice number as payment reference.</p>
         <p>Bank: ${invoice?.bankName || '-'}<br/>Account holder: ${invoice?.bankAccountHolder || '-'}<br/>IBAN: ${invoice?.iban || '-'}<br/>BIC: ${invoice?.bic || '-'}</p>
         <p>Due date: ${invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : '-'}</p>`
      : `<p>Bitte überweisen Sie den Gesamtbetrag mit der Rechnungsnummer als Verwendungszweck.</p>
         <p>Bank: ${invoice?.bankName || '-'}<br/>Kontoinhaber: ${invoice?.bankAccountHolder || '-'}<br/>IBAN: ${invoice?.iban || '-'}<br/>BIC: ${invoice?.bic || '-'}</p>
         <p>Fällig am: ${invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('de-DE') : '-'}</p>`

  const html =
    locale === 'en'
      ? `<h2>Thank you for your order</h2><p>Invoice: <strong>${invoice?.invoiceNumber || '-'}</strong></p>${itemsTable(order)}${totals(order)}${paymentDetails}<p><a href="${getOrderURL(order, locale)}">View order</a></p>`
      : `<h2>Vielen Dank für Ihre Bestellung</h2><p>Rechnung: <strong>${invoice?.invoiceNumber || '-'}</strong></p>${itemsTable(order)}${totals(order)}${paymentDetails}<p><a href="${getOrderURL(order, locale)}">Bestellung ansehen</a></p>`

  await send({ html, payload, subject, to })
}

export const sendB2BPaymentReceived = async ({
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

  const subject =
    locale === 'en'
      ? `Payment received for invoice ${order.invoice?.invoiceNumber || order.id}`
      : `Zahlung für Rechnung ${order.invoice?.invoiceNumber || order.id} erhalten`

  const html =
    locale === 'en'
      ? `<p>We received your payment for invoice <strong>${order.invoice?.invoiceNumber || '-'}</strong>.</p><p><a href="${getOrderURL(order, locale)}">View order</a></p>`
      : `<p>Wir haben Ihre Zahlung für die Rechnung <strong>${order.invoice?.invoiceNumber || '-'}</strong> erhalten.</p><p><a href="${getOrderURL(order, locale)}">Bestellung ansehen</a></p>`

  await send({ html, payload, subject, to })
}

export const sendB2BOrderCancelled = async ({
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

  const subject =
    locale === 'en'
      ? `Order ${order.invoice?.invoiceNumber || order.id} cancelled`
      : `Bestellung ${order.invoice?.invoiceNumber || order.id} storniert`

  const html =
    locale === 'en'
      ? `<p>Your order has been cancelled. If you have questions, please contact us.</p>`
      : `<p>Ihre Bestellung wurde storniert. Bei Fragen kontaktieren Sie uns bitte.</p>`

  await send({ html, payload, subject, to })
}

export const sendB2BOrderNotification = async ({
  order,
  payload,
  settings,
}: {
  order: EmailOrder
  payload: Payload
  settings: { orderNotificationEmail?: null | string } | null
}): Promise<void> => {
  const to = settings?.orderNotificationEmail
  if (!to) return

  const subject = `New B2B order ${order.invoice?.invoiceNumber || order.id}`
  const html = `<h2>New B2B order</h2><p>Company: <strong>${order.companySnapshot?.companyName || '-'}</strong></p><p>Invoice: <strong>${order.invoice?.invoiceNumber || '-'}</strong></p>${itemsTable(order)}${totals(order)}<p><a href="${getOrderURL(order, 'de')}">Open in store</a></p>`

  await send({ html, payload, subject, to })
}
