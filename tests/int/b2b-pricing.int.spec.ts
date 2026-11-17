import { describe, expect, it } from 'vitest'

import { priceCartItems } from '@/b2b/utilities/priceCartItems'
import {
  calculateB2BTotals,
  PRODUCT_NOT_B2B_ELIGIBLE,
  resolveB2BLine,
  resolveB2BMinOrderQuantity,
  resolveB2BUnitPrice,
} from '@/b2b/utilities/pricing'

const product = {
  b2bMinOrderQuantity: 5,
  b2bPriceInEUR: 1000,
  id: 'product-1',
  priceInEUR: 1500,
}

describe('B2B pricing', () => {
  it('applies the partner discount to the B2B price, not the retail price', () => {
    expect(resolveB2BUnitPrice({ discountPercent: 10, product })).toBe(900)
  })

  it('uses a variant B2B price when present', () => {
    expect(
      resolveB2BUnitPrice({
        discountPercent: 0,
        product,
        variant: { b2bPriceInEUR: 750, id: 'variant-1' },
      }),
    ).toBe(750)
  })

  it('rejects products without a B2B price', () => {
    expect(() =>
      resolveB2BUnitPrice({
        discountPercent: 0,
        product: { id: 'product-2', priceInEUR: 1500 },
      }),
    ).toThrow(PRODUCT_NOT_B2B_ELIGIBLE)
  })

  it('uses the variant minimum order quantity first', () => {
    expect(
      resolveB2BMinOrderQuantity({
        product,
        variant: { b2bMinOrderQuantity: 10, id: 'variant-1' },
      }),
    ).toBe(10)
  })

  it('falls back to the product minimum when a variant has the legacy default of 1', () => {
    expect(
      resolveB2BMinOrderQuantity({
        product: { b2bMinOrderQuantity: 10, id: 'product-1' },
        variant: { b2bMinOrderQuantity: 1, id: 'variant-1' },
      }),
    ).toBe(10)
  })

  it('uses an explicit variant minimum above 1', () => {
    expect(
      resolveB2BMinOrderQuantity({
        product: { b2bMinOrderQuantity: 10, id: 'product-1' },
        variant: { b2bMinOrderQuantity: 5, id: 'variant-1' },
      }),
    ).toBe(5)
  })

  it('falls back to the product minimum when the variant has no value', () => {
    expect(
      resolveB2BMinOrderQuantity({
        product: { b2bMinOrderQuantity: 10, id: 'product-1' },
        variant: { id: 'variant-1' },
      }),
    ).toBe(10)
  })

  it('marks a line below the minimum quantity as invalid', () => {
    const line = resolveB2BLine({ discountPercent: 0, product, quantity: 3 })

    expect(line.unitPrice).toBe(0)
    expect(line.lineTotal).toBe(0)
    expect(line.issue).toContain('5')
  })

  it('allows B2B backorders instead of blocking a zero-inventory line', async () => {
    const payload = {
      findByID: async ({ collection }: { collection: string }) =>
        collection === 'products'
          ? {
              b2bMinOrderQuantity: 5,
              b2bPriceInEUR: 9000,
              id: 'product-1',
              inventory: 0,
            }
          : {
              id: 'variant-1',
              inventory: 0,
            },
    }

    const result = await priceCartItems({
      channel: 'b2b',
      discountPercent: 0,
      items: [{ product: 'product-1', quantity: 5, variant: 'variant-1' }],
      payload: payload as never,
    })

    expect(result.issues).toEqual([])
    expect(result.items[0].unitPrice).toBe(9000)
    expect(result.items[0].lineTotal).toBe(45000)
  })

  it('calculates net, VAT and gross amounts in cents', () => {
    expect(calculateB2BTotals(10000, 19)).toEqual({
      grossAmount: 11900,
      netAmount: 10000,
      vatAmount: 1900,
    })
  })
})
