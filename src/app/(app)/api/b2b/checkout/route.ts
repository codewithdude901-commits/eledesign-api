import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isApprovedB2BUser } from '@/access/b2b'
import {
  sendB2BOrderConfirmation,
  sendB2BOrderNotification,
  type EmailOrder,
} from '@/b2b/emails/sendOrderEmails'
import { allocateInvoiceNumber } from '@/b2b/utilities/invoiceNumber'
import { priceCartItems, type PriceableCartItem } from '@/b2b/utilities/priceCartItems'
import { calculateB2BTotals, getProductID } from '@/b2b/utilities/pricing'
import { getB2BSettings } from '@/b2b/utilities/settings'

type B2BUser = {
  b2b?: {
    companyName?: null | string
    contactName?: null | string
    discountPercent?: null | number
    invoiceEmail?: null | string
    preferredLocale?: 'de' | 'en' | null
    vatId?: null | string
  } | null
  email?: null | string
  id: number | string
}

type CartRecord = {
  channel?: 'b2b' | 'b2c' | null
  customer?: unknown
  id: number | string
  items?: null | PriceableCartItem[]
}

export async function POST(request: Request) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!isApprovedB2BUser(user)) {
    return NextResponse.json(
      { error: 'An approved business account is required.' },
      { status: 403 },
    )
  }

  const businessUser = user as unknown as B2BUser
  const body = (await request.json().catch(() => null)) as
    | {
        billingAddress?: unknown
        cartID?: string
        customerNotes?: string
        locale?: 'de' | 'en'
        purchaseOrderNumber?: string
        shippingAddress?: unknown
      }
    | null

  if (!body?.cartID || !body.billingAddress) {
    return NextResponse.json(
      { error: 'A cart and billing address are required.' },
      { status: 400 },
    )
  }

  try {
    const cart = (await payload.findByID({
      collection: 'carts',
      depth: 1,
      id: body.cartID,
      overrideAccess: true,
    })) as unknown as CartRecord

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found.' }, { status: 404 })
    }
    const cartCustomer = getProductID(cart.customer)
    if (!cartCustomer || cartCustomer !== String(businessUser.id)) {
      return NextResponse.json(
        { error: 'This cart does not belong to your account.' },
        { status: 403 },
      )
    }

    if (cart.channel !== 'b2b') {
      return NextResponse.json(
        { error: 'This is not a B2B cart. Please refresh and try again.' },
        { status: 400 },
      )
    }

    const priced = await priceCartItems({
      channel: 'b2b',
      discountPercent: businessUser.b2b?.discountPercent,
      items: cart.items || [],
      payload,
      usePopulatedItems: true,
    })
    if (priced.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    if (priced.issues.length > 0) {
      return NextResponse.json({ error: priced.issues[0] }, { status: 400 })
    }

    const settings = await getB2BSettings(payload)
    const minimumOrderValue = Number(settings.minimumOrderValue || 0)

    if (minimumOrderValue > 0 && priced.subtotal < minimumOrderValue) {
      return NextResponse.json(
        {
          error: `The minimum order value is ${(minimumOrderValue / 100).toFixed(2)} EUR net.`,
        },
        { status: 400 },
      )
    }

    const vatRate = Number(settings.vatRatePercent ?? 19)
    const totals = calculateB2BTotals(priced.subtotal, vatRate)
    const invoiceNumber = await allocateInvoiceNumber({
      payload,
      prefix: settings.invoiceNumberPrefix || 'INV',
    })
    const dueDays = Number(settings.invoiceDueDays ?? 14)
    const dueDate = new Date(
      Date.now() + dueDays * 24 * 60 * 60 * 1000,
    ).toISOString()
    const locale = businessUser.b2b?.preferredLocale === 'en' ? 'en' : 'de'
    const invoiceEmail = businessUser.b2b?.invoiceEmail || businessUser.email || ''
    const shippingAddress = body.shippingAddress || body.billingAddress
    const requestedLocale = body.locale === 'en' ? 'en' : 'de'
    const orderItems = priced.items.map((item) => {
      const product =
        item.product && typeof item.product === 'object'
          ? (item.product as unknown as {
              common_name?: null | string
              title?: null | string
            })
          : null
      const productName =
        requestedLocale === 'de'
          ? product?.common_name || product?.title
          : product?.title

      return {
        lineTotal: item.lineTotal,
        product: getProductID(item.product),
        product_name: productName || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        variant: getProductID(item.variant),
      }
    })
    const order = (await payload.create({
      collection: 'orders',
      data: {
        amount: totals.grossAmount,
        b2bStatus: 'awaiting_payment',
        billingAddress: body.billingAddress,
        channel: 'b2b',
        companySnapshot: {
          companyName: businessUser.b2b?.companyName,
          contactName: businessUser.b2b?.contactName,
          email: invoiceEmail,
          preferredLocale: locale,
          vatId: businessUser.b2b?.vatId,
        },
        currency: 'EUR',
        customer: businessUser.id,
        customerEmail: invoiceEmail,
        customerNotes: body.customerNotes,
        invoice: {
          bankAccountHolder: settings.bankAccountHolder,
          bankName: settings.bankName,
          bic: settings.bic,
          dueDate,
          footerText: settings.invoiceFooterText,
          grossAmount: totals.grossAmount,
          iban: settings.iban,
          invoiceNumber,
          netAmount: totals.netAmount,
          paymentReference: invoiceNumber,
          vatAmount: totals.vatAmount,
          vatRate,
        },
        items: orderItems,
        purchaseOrderNumber: body.purchaseOrderNumber,
        shippingAddress,
        status: 'processing',
      } as never,
      disableTransaction: true,
      overrideAccess: true,
    })) as unknown as EmailOrder

    // Close the active cart so the provider starts a fresh one next time.
    try {
      await payload.db.updateOne({
        collection: 'carts',
        data: {
          items: [],
          purchasedAt: new Date().toISOString(),
          subtotal: 0,
        },
        id: cart.id,
      })
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Failed to close B2B cart after order' })
    }

    // The plugin's payment handler normally owns this step. This endpoint
    // bypasses that handler, so reserve stock here instead.
    await Promise.all(
      priced.items.map(async (item) => {
        const quantity = Math.max(0, Number(item.quantity) || 0)
        if (!quantity) return

        const variantID = getProductID(item.variant)
        const productID = getProductID(item.product)

        try {
          if (variantID) {
            await payload.db.updateOne({
              collection: 'variants',
              data: { inventory: { $inc: -quantity } },
              id: variantID,
            })
          } else if (productID) {
            await payload.db.updateOne({
              collection: 'products',
              data: { inventory: { $inc: -quantity } },
              id: productID,
            })
          }
        } catch (error) {
          payload.logger.error({ err: error, msg: 'Failed to reserve B2B order inventory' })
        }
      }),
    )

    void sendB2BOrderConfirmation({
      locale,
      order,
      payload,
    })

    void sendB2BOrderNotification({
      order,
      payload,
      settings,
    })

    return NextResponse.json({ orderID: order.id })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'B2B checkout failed' })
    return NextResponse.json(
      { error: 'The order could not be placed. Please try again.' },
      { status: 500 },
    )
  }
}
