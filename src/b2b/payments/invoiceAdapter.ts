import type { GroupField, Payload } from 'payload'
import { APIError } from 'payload'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { isApprovedB2BUser } from '@/access/b2b'
import {
  sendB2BOrderConfirmation,
  sendB2BOrderNotification,
  type EmailOrder,
} from '@/b2b/emails/sendOrderEmails'
import { allocateInvoiceNumber } from '@/b2b/utilities/invoiceNumber'
import { priceCartItems } from '@/b2b/utilities/priceCartItems'
import { calculateB2BTotals, getProductID } from '@/b2b/utilities/pricing'

type B2BUser = {
  accountType?: 'b2b' | 'b2c' | null
  b2b?: {
    companyName?: null | string
    contactName?: null | string
    discountPercent?: null | number
    invoiceEmail?: null | string
    preferredLocale?: 'de' | 'en' | null
    status?: 'approved' | 'pending' | 'suspended' | null
    vatId?: null | string
  } | null
  email?: null | string
  id: number | string
}

type InvoiceData = {
  bankAccountHolder?: null | string
  bankName?: null | string
  bic?: null | string
  customerNotes?: null | string
  dueDate?: null | string
  footerText?: null | string
  grossAmount?: null | number
  iban?: null | string
  invoiceNumber?: null | string
  netAmount?: null | number
  paymentReference?: null | string
  purchaseOrderNumber?: null | string
  vatAmount?: null | number
  vatRate?: null | number
}

type Settings = {
  bankAccountHolder?: null | string
  bankName?: null | string
  bic?: null | string
  iban?: null | string
  invoiceDueDays?: null | number
  invoiceFooterText?: null | string
  invoiceNumberPrefix?: null | string
  minimumOrderValue?: null | number
  orderNotificationEmail?: null | string
  vatRatePercent?: null | number
}

const SETTINGS_CACHE_MS = 30_000
let settingsCache: { at: number; value: Settings } | null = null

type TransactionRecord = {
  amount?: null | number
  billingAddress?: unknown
  cart?: unknown
  customer?: unknown
  customerEmail?: null | string
  id: number | string
  invoice?: InvoiceData | null
  items?: null | Array<Record<string, unknown>>
  paymentMethod?: null | string
  shippingAddress?: unknown
  status?: null | string
}

const invoiceGroup: GroupField = {
  name: 'invoice',
  type: 'group',
  admin: {
    condition: (data) => data?.paymentMethod === 'invoice',
  },
  fields: [
    { name: 'invoiceNumber', type: 'text', label: 'Invoice number' },
    { name: 'dueDate', type: 'date', label: 'Due date' },
    { name: 'netAmount', type: 'number', label: 'Net amount (cents)' },
    { name: 'vatRate', type: 'number', label: 'VAT rate (%)' },
    { name: 'vatAmount', type: 'number', label: 'VAT amount (cents)' },
    { name: 'grossAmount', type: 'number', label: 'Gross amount (cents)' },
    { name: 'bankAccountHolder', type: 'text' },
    { name: 'bankName', type: 'text' },
    { name: 'iban', type: 'text', label: 'IBAN' },
    { name: 'bic', type: 'text', label: 'BIC' },
    { name: 'paymentReference', type: 'text' },
    { name: 'purchaseOrderNumber', type: 'text', label: 'Purchase order number' },
    { name: 'customerNotes', type: 'textarea', label: 'Customer notes' },
    { name: 'footerText', type: 'textarea', label: 'Invoice footer' },
    { name: 'paidAt', type: 'date', label: 'Paid at' },
  ],
}

const getSettings = async (payload: Payload): Promise<Settings> => {
  if (settingsCache && Date.now() - settingsCache.at < SETTINGS_CACHE_MS) {
    return settingsCache.value
  }

  const settings = ((await payload.findGlobal({
    depth: 0,
    overrideAccess: true,
    slug: 'b2b-settings',
  })) as unknown as Settings) || {}

  settingsCache = {
    at: Date.now(),
    value: settings,
  }

  return settings
}

const getLocale = (user: B2BUser): 'de' | 'en' =>
  user.b2b?.preferredLocale === 'en' ? 'en' : 'de'

const guardB2B = (user: unknown): B2BUser => {
  if (!isApprovedB2BUser(user)) {
    throw new APIError('An approved business account is required for invoice orders.', 403)
  }

  return user as unknown as B2BUser
}

const getInvoiceEmail = (user: B2BUser): string =>
  user.b2b?.invoiceEmail || user.email || ''

const initiatePayment: PaymentAdapter['initiatePayment'] = async ({
  data,
  req,
  transactionsSlug = 'transactions',
}) => {
  const user = guardB2B(req.user)
  const additionalData = data as unknown as {
    customerNotes?: string
    purchaseOrderNumber?: string
  }
  const cartID = data.cart?.id

  if (!cartID) {
    return { error: 'No cart was found.', message: 'No cart was found.' }
  }

  const cart = (await req.payload.findByID({
    collection: 'carts',
    depth: 1,
    id: cartID,
    overrideAccess: true,
  })) as unknown as {
    channel?: 'b2b' | 'b2c' | null
    customer?: unknown
    id: number | string
    items?: Array<Record<string, unknown>> | null
    subtotal?: null | number
  }

  if (!cart) {
    return { error: 'Cart not found.', message: 'Cart not found.' }
  }
  const cartCustomer = getProductID(cart.customer)
  if (!cartCustomer || cartCustomer !== String(user.id)) {
    throw new APIError('This cart does not belong to your business account.', 403)
  }

  if (cart.channel !== 'b2b') {
    return {
      error: 'This cart is not a B2B cart. Please refresh and try again.',
      message: 'Invalid cart channel.',
    }
  }

  const priced = await priceCartItems({
    channel: 'b2b',
    discountPercent: user.b2b?.discountPercent,
    items: cart.items || [],
    payload: req.payload,
    usePopulatedItems: true,
  })
  if (priced.items.length === 0) {
    return {
      error: 'Your cart is empty.',
      message: 'Your cart is empty.',
    }
  }

  if (priced.issues.length > 0) {
    return {
      error: priced.issues[0],
      message: 'The cart contains items that cannot be ordered.',
    }
  }

  const settings = await getSettings(req.payload)
  const minimumOrderValue = Number(settings.minimumOrderValue || 0)

  if (minimumOrderValue > 0 && priced.subtotal < minimumOrderValue) {
    return {
      error: `The minimum order value is ${(minimumOrderValue / 100).toFixed(2)} EUR net.`,
      message: 'Minimum order value not reached.',
    }
  }

  const vatRatePercent = Number(settings.vatRatePercent ?? 19)
  const totals = calculateB2BTotals(priced.subtotal, vatRatePercent)
  const prefix = settings.invoiceNumberPrefix || 'INV'
  const invoiceNumber = await allocateInvoiceNumber({ payload: req.payload, prefix })
  const dueDays = Number(settings.invoiceDueDays ?? 14)
  const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString()
  const invoice: InvoiceData = {
    bankAccountHolder: settings.bankAccountHolder,
    bankName: settings.bankName,
    bic: settings.bic,
    customerNotes: additionalData.customerNotes || undefined,
    dueDate,
    footerText: settings.invoiceFooterText,
    grossAmount: totals.grossAmount,
    iban: settings.iban,
    invoiceNumber,
    netAmount: totals.netAmount,
    paymentReference: invoiceNumber,
    purchaseOrderNumber: additionalData.purchaseOrderNumber || undefined,
    vatAmount: totals.vatAmount,
    vatRate: vatRatePercent,
  }

  const transaction = await req.payload.create({
    collection: transactionsSlug as 'transactions',
    data: {
      amount: totals.grossAmount,
      billingAddress: data.billingAddress,
      cart: cart.id,
      currency: 'EUR',
      customer: user.id,
      customerEmail: getInvoiceEmail(user),
      invoice,
      items: priced.items,
      paymentMethod: 'invoice',
      shippingAddress: data.shippingAddress,
      status: 'pending',
    } as never,
    overrideAccess: true,
    req,
  })
  return {
    dueDate,
    grossAmount: totals.grossAmount,
    invoiceNumber,
    message: 'Invoice order initiated.',
    netAmount: totals.netAmount,
    transactionID: transaction.id,
    vatAmount: totals.vatAmount,
  }
}

const confirmOrder: PaymentAdapter['confirmOrder'] = async ({
  cartsSlug = 'carts',
  data,
  ordersSlug = 'orders',
  req,
  transactionsSlug = 'transactions',
}) => {
  const user = guardB2B(req.user)
  const transactionID = data.transactionID

  if (!transactionID) {
    throw new APIError('A transaction is required to confirm the order.', 400)
  }

  const transaction = (await req.payload.findByID({
    collection: transactionsSlug as 'transactions',
    depth: 1,
    id: transactionID,
    overrideAccess: true,
  })) as unknown as TransactionRecord

  if (!transaction) {
    throw new APIError('Transaction not found.', 404)
  }

  const transactionCustomer = getProductID(transaction.customer)
  if (!transactionCustomer || transactionCustomer !== String(user.id)) {
    throw new APIError('This transaction does not belong to your account.', 403)
  }

  if (transaction.paymentMethod !== 'invoice' || transaction.status !== 'pending') {
    throw new APIError('This transaction cannot be confirmed.', 400)
  }
  const invoice = transaction.invoice || {}
  const cartID = getProductID(transaction.cart)
  const locale = getLocale(user)
  const settings = await getSettings(req.payload)
  const additional = data as unknown as {
    billingAddress?: unknown
    shippingAddress?: unknown
  }
  const billingAddress = transaction.billingAddress || additional.billingAddress
  const shippingAddress =
    transaction.shippingAddress ||
    additional.shippingAddress ||
    billingAddress

  const order = (await req.payload.create({
    collection: ordersSlug as 'orders',
    data: {
      amount: transaction.amount,
      b2bStatus: 'awaiting_payment',
      billingAddress,
      channel: 'b2b',
      companySnapshot: {
        companyName: user.b2b?.companyName,
        contactName: user.b2b?.contactName,
        email: getInvoiceEmail(user),
        preferredLocale: locale,
        vatId: user.b2b?.vatId,
      },
      currency: 'EUR',
      customer: user.id,
      customerEmail: getInvoiceEmail(user),
      customerNotes: invoice.customerNotes,
      invoice: {
        ...invoice,
        paymentReference: invoice.invoiceNumber,
      },
      items: transaction.items,
      purchaseOrderNumber: invoice.purchaseOrderNumber,
      shippingAddress,
      status: 'processing',
      transactions: [transaction.id],
    } as never,
    overrideAccess: true,
    req,
  })) as unknown as EmailOrder
  if (cartID) {
    try {
      // Direct write: the cart is being closed, not edited by a customer, so
      // running the beforeChange pricing hook and access checks again is waste.
      await req.payload.db.updateOne({
        collection: cartsSlug as 'carts',
        data: {
          items: [],
          purchasedAt: new Date().toISOString(),
          subtotal: 0,
        },
        id: cartID,
      })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Failed to close B2B cart after order' })
    }
  }
  // The order already links to this transaction. The reverse link is only
  // informational in the admin UI and costs another full DB write here.

  // Do not block the checkout response on the email provider. Both helpers
  // catch and log their own failures.
  void sendB2BOrderConfirmation({
    locale,
    order,
    payload: req.payload,
  })

  void sendB2BOrderNotification({
    order,
    payload: req.payload,
    settings,
  })
  return {
    message: 'Order confirmed.',
    orderID: String(order.id),
    transactionID: String(transaction.id),
  }
}

export const invoiceAdapter = (): PaymentAdapter => ({
  confirmOrder,
  group: invoiceGroup,
  initiatePayment,
  label: 'Invoice / Bank Transfer',
  name: 'invoice',
})
