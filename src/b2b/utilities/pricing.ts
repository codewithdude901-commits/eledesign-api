export type B2BPricingProduct = {
  b2bMinOrderQuantity?: null | number
  b2bPriceInEUR?: null | number
  id: number | string
  inventory?: null | number
  priceInEUR?: null | number
  title?: null | string
}

export type B2BPricingVariant = {
  b2bMinOrderQuantity?: null | number
  b2bPriceInEUR?: null | number
  id: number | string
  inventory?: null | number
  priceInEUR?: null | number
  title?: null | string
}

export type B2BLineResult = {
  issue: null | string
  lineTotal: number
  unitPrice: number
}

export const PRODUCT_NOT_B2B_ELIGIBLE =
  'This product is not available for business partners.'

export const resolveB2BUnitPrice = ({
  discountPercent,
  product,
  variant,
}: {
  discountPercent?: null | number
  product?: B2BPricingProduct | null
  variant?: B2BPricingVariant | null
}): number => {
  const base = variant?.b2bPriceInEUR ?? product?.b2bPriceInEUR

  if (base == null) {
    throw new Error(PRODUCT_NOT_B2B_ELIGIBLE)
  }

  const discount = Math.min(Math.max(discountPercent ?? 0, 0), 100)

  return Math.round((base * (100 - discount)) / 100)
}

export const resolveB2BMinOrderQuantity = ({
  product,
  variant,
}: {
  product?: B2BPricingProduct | null
  variant?: B2BPricingVariant | null
}): number => {
  const variantValue = variant?.b2bMinOrderQuantity
  const productValue = product?.b2bMinOrderQuantity

  // Variant rows historically receive a default of 1. Treat that default as
  // "no variant override" so a product-level minimum still applies to variants.
  const variantOverride =
    typeof variantValue === 'number' && variantValue > 1 ? variantValue : null
  const value = variantOverride ?? productValue ?? variantValue ?? 1

  return Math.max(1, Math.ceil(value ?? 1))
}

export const resolveRetailUnitPrice = ({
  product,
  variant,
}: {
  product?: B2BPricingProduct | null
  variant?: B2BPricingVariant | null
}): number => variant?.priceInEUR ?? product?.priceInEUR ?? 0

export const resolveB2BLine = ({
  discountPercent,
  product,
  quantity,
  variant,
}: {
  discountPercent?: null | number
  product?: B2BPricingProduct | null
  quantity: number
  variant?: B2BPricingVariant | null
}): B2BLineResult => {
  const base = variant?.b2bPriceInEUR ?? product?.b2bPriceInEUR

  if (base == null) {
    return {
      issue: PRODUCT_NOT_B2B_ELIGIBLE,
      lineTotal: 0,
      unitPrice: 0,
    }
  }

  const minOrderQuantity = resolveB2BMinOrderQuantity({ product, variant })

  if (quantity < minOrderQuantity) {
    return {
      issue: `The minimum order quantity for this item is ${minOrderQuantity}.`,
      lineTotal: 0,
      unitPrice: 0,
    }
  }

  const unitPrice = resolveB2BUnitPrice({ discountPercent, product, variant })

  return {
    issue: null,
    lineTotal: unitPrice * quantity,
    unitPrice,
  }
}

export const calculateB2BTotals = (netSubtotal: number, vatRatePercent: number) => {
  const vatAmount = Math.round((netSubtotal * vatRatePercent) / 100)

  return {
    grossAmount: netSubtotal + vatAmount,
    netAmount: netSubtotal,
    vatAmount,
  }
}

export const formatEuro = (amountInCents: number) =>
  new Intl.NumberFormat('de-DE', {
    currency: 'EUR',
    style: 'currency',
  }).format(amountInCents / 100)

export const getProductID = (value: unknown): null | string => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }

  return null
}
