'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'
import {
  formatEuro,
  resolveB2BMinOrderQuantity,
  resolveB2BUnitPrice,
} from '@/b2b/utilities/pricing'

type Props = {
  discountPercent: number
  locale: 'de' | 'en'
  product: Product
}

export const BusinessProductDetail: React.FC<Props> = ({
  discountPercent,
  locale,
  product,
}) => {
  const { addItem } = useCart()
  const variants = useMemo(
    () =>
      (product.variants?.docs || []).filter(
        (variant): variant is Variant => Boolean(variant && typeof variant === 'object'),
      ),
    [product.variants],
  )
  const [selectedVariantID, setSelectedVariantID] = useState<string | undefined>(
    variants[0]?.id,
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantID)
  const minQuantity = resolveB2BMinOrderQuantity({
    product,
    variant: selectedVariant,
  })

  useEffect(() => {
    setQuantity((current) => Math.max(current, minQuantity))
  }, [minQuantity])

  let unitPrice: null | number = null

  try {
    unitPrice = resolveB2BUnitPrice({
      discountPercent,
      product,
      variant: selectedVariant,
    })
  } catch {
    unitPrice = null
  }

  const image = product.gallery?.[0]?.image

  const handleAdd = async () => {
    if (unitPrice == null) {
      toast.error(
        locale === 'de'
          ? 'Dieses Produkt ist für B2B nicht verfügbar.'
          : 'This product is not available for B2B.',
      )
      return
    }

    setIsAdding(true)

    try {
      await addItem(
        {
          product: product.id,
          ...(selectedVariant ? { variant: selectedVariant.id } : {}),
        },
        Math.max(minQuantity, Math.floor(quantity) || minQuantity),
      )

      toast.success(
        locale === 'de' ? 'Zum B2B-Warenkorb hinzugefügt.' : 'Added to your B2B cart.',
      )
    } catch {
      toast.error(
        locale === 'de'
          ? 'Das Produkt konnte nicht hinzugefügt werden.'
          : 'The product could not be added.',
      )
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-none border bg-stone-100">
        {image && typeof image === 'object' ? (
          <Media
            className="h-full w-full"
            fill
            imgClassName="object-cover"
            resource={image}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-primary/40">
            {locale === 'de' ? 'Kein Bild' : 'No image'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary/50">{product.sku}</p>
          <h1 className="mt-1 text-3xl font-semibold">
            {product.common_name || product.title}
          </h1>
          {product.botanical_name ? (
            <p className="mt-1 text-sm italic text-primary/60">{product.botanical_name}</p>
          ) : null}
        </div>

        <div>
          <p className="text-3xl font-semibold">
            {unitPrice != null ? formatEuro(unitPrice) : '-'}
            <span className="ml-2 text-sm font-normal text-primary/50">
              {locale === 'de' ? 'netto zzgl. MwSt.' : 'net excl. VAT'}
            </span>
          </p>
          {discountPercent > 0 && (
            <p className="mt-1 text-sm text-emerald-700">
              {locale === 'de'
                ? `Ihr Partnernachlass: ${discountPercent}%`
                : `Your partner discount: ${discountPercent}%`}
            </p>
          )}
        </div>

        {product.description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-primary/70">
            {product.description}
          </p>
        ) : null}

        {variants.length > 0 && (
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="b2b-variant">
              {locale === 'de' ? 'Variante' : 'Variant'}
            </label>
            <select
              className="h-10 rounded-none border bg-white px-3 text-sm"
              id="b2b-variant"
              onChange={(event) => {
                setSelectedVariantID(event.target.value)
                setQuantity(1)
              }}
              value={selectedVariantID}
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title || variant.id}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="b2b-quantity">
            {locale === 'de' ? 'Menge' : 'Quantity'}
          </label>
          <input
            className="h-10 w-32 rounded-none border px-3 text-sm"
            id="b2b-quantity"
            min={minQuantity}
            onChange={(event) => setQuantity(Number(event.target.value) || minQuantity)}
            type="number"
            value={quantity}
          />
          <p className="text-xs text-primary/50">
            {locale === 'de'
              ? `Mindestbestellmenge: ${minQuantity}`
              : `Minimum order quantity: ${minQuantity}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isAdding || unitPrice == null} onClick={handleAdd} type="button">
            {isAdding
              ? locale === 'de'
                ? 'Wird hinzugefügt...'
                : 'Adding...'
              : locale === 'de'
                ? 'In den Warenkorb'
                : 'Add to cart'}
          </Button>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href={`/${locale}/business/cart`}
          >
            {locale === 'de' ? 'Warenkorb ansehen' : 'View cart'}
          </Link>
        </div>
      </div>
    </div>
  )
}
