'use client'

import type { Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()

  let amount = 0
  let lowestAmount = 0
  let highestAmount = 0

  const priceField = `priceIn${currency.code}` as keyof Product

  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const variantPriceField = `priceIn${currency.code}` as keyof Variant

    const variantsOrderedByPrice =
      product.variants?.docs
        ?.filter((variant): variant is Variant => Boolean(variant && typeof variant === 'object'))
        .sort((a, b) => {
          const aPrice = a[variantPriceField]
          const bPrice = b[variantPriceField]

          if (typeof aPrice === 'number' && typeof bPrice === 'number') {
            return aPrice - bPrice
          }

          return 0
        }) ?? []

    const lowestVariant = variantsOrderedByPrice[0]?.[variantPriceField]

    const highestVariant =
      variantsOrderedByPrice[variantsOrderedByPrice.length - 1]?.[variantPriceField]

    if (typeof lowestVariant === 'number' && typeof highestVariant === 'number') {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-medium">{product.title}</h1>

        <div className="uppercase font-mono">
          {hasVariants ? (
            <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
          ) : (
            <Price amount={amount} />
          )}
        </div>
      </div>

      {product.description ? (
        <p className="whitespace-pre-line text-base leading-relaxed text-brand-charcoal/80">
          {product.description}
        </p>
      ) : null}

      <hr />

      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>

          <hr />
        </>
      )}

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
