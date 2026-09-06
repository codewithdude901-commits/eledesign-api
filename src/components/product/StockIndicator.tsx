'use client'
import { Product, Variant } from '@/payload-types'
import { BadgeAlert } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    const variantId = searchParams.get('variant')

    console.log('URL variant:', variantId)
    console.log('variants:', variants)

    if (product.enableVariants && variants.length) {
      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }

        return String(variant) === variantId
      })

      console.log('validVariant:', validVariant)

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0
      }
    }
    return product.inventory || 0
  }, [product.enableVariants, selectedVariant, product.inventory])

  if (product.enableVariants && !selectedVariant) {
    return null
  }

  return (
    <div className="uppercase text-sm font-medium text-orange-600">
      {stockQuantity < 15 && stockQuantity > 0 && (
        <p className=" flex items-center">
          <BadgeAlert className="mr-2 size-4.5" />
          Only {stockQuantity} left in stock
        </p>
      )}
      {(stockQuantity === 0 || !stockQuantity) && <p>Out of stock</p>}
    </div>
  )
}
