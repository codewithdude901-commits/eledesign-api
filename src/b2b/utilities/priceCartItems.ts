import type { Payload } from 'payload'

import {
  getProductID,
  resolveB2BLine,
  resolveRetailUnitPrice,
  type B2BPricingProduct,
  type B2BPricingVariant,
} from './pricing'

export type PriceableCartItem = {
  b2bIssue?: null | string
  lineTotal?: null | number
  product?: unknown
  quantity?: null | number
  unitPrice?: null | number
  variant?: unknown
}

export type PricedCartItem = PriceableCartItem & {
  b2bIssue: null | string
  lineTotal: number
  quantity: number
  unitPrice: number
}

export const priceCartItems = async ({
  channel,
  discountPercent,
  items,
  payload,
  usePopulatedItems = false,
}: {
  channel: 'b2b' | 'b2c'
  discountPercent?: null | number
  items: PriceableCartItem[]
  payload: Payload
  usePopulatedItems?: boolean
}): Promise<{ items: PricedCartItem[]; issues: string[]; subtotal: number }> => {
  const issues: string[] = []
  let subtotal = 0

  const pricedItems = await Promise.all(
    items.map(async (item) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
      const productID = getProductID(item.product)
      const variantID = getProductID(item.variant)
      const populatedProduct =
        item.product && typeof item.product === 'object'
          ? (item.product as unknown as B2BPricingProduct)
          : null
      const populatedVariant =
        item.variant && typeof item.variant === 'object'
          ? (item.variant as unknown as B2BPricingVariant)
          : null

      let product: B2BPricingProduct | null = usePopulatedItems
        ? populatedProduct
        : null
      let variant: B2BPricingVariant | null = usePopulatedItems
        ? populatedVariant
        : null

      try {
        if (!product && productID) {
          product = (await payload.findByID({
            collection: 'products',
            depth: 0,
            id: productID,
            overrideAccess: true,
          })) as unknown as B2BPricingProduct
        }

        if (!variant && variantID) {
          variant = (await payload.findByID({
            collection: 'variants',
            depth: 0,
            id: variantID,
            overrideAccess: true,
          })) as unknown as B2BPricingVariant
        }
      } catch {
        issues.push('An item in the cart is no longer available.')
        return {
          ...item,
          b2bIssue: 'This item is no longer available.',
          lineTotal: 0,
          quantity,
          unitPrice: 0,
        }
      }

      if (!product) {
        issues.push('An item in the cart is no longer available.')
        return {
          ...item,
          b2bIssue: 'This item is no longer available.',
          lineTotal: 0,
          quantity,
          unitPrice: 0,
        }
      }

      if (channel === 'b2b') {
        const line = resolveB2BLine({
          discountPercent,
          product,
          quantity,
          variant,
        })

        if (line.issue) issues.push(line.issue)

        subtotal += line.lineTotal

        return {
          ...item,
          b2bIssue: line.issue,
          lineTotal: line.lineTotal,
          quantity,
          unitPrice: line.unitPrice,
        }
      }

      const unitPrice = resolveRetailUnitPrice({ product, variant })
      const lineTotal = unitPrice * quantity
      subtotal += lineTotal

      return {
        ...item,
        b2bIssue: null,
        lineTotal,
        quantity,
        unitPrice,
      }
    }),
  )

  return {
    issues,
    items: pricedItems,
    subtotal,
  }
}
