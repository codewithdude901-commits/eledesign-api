'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'
import { useCartInitialization } from '@/providers/CartInitialization'
import { useCartUI } from '@/providers/CartUIContext'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { addItem, cart, isLoading } = useCart()
  const { isCartInitialized } = useCartInitialization()
  const { openCart } = useCartUI()

  const params = useParams<{ locale: 'de' | 'en' }>()
  const locale = params.locale

  const searchParams = useSearchParams()
  const router = useRouter()

  const [isAutoAdding, setIsAutoAdding] = useState(false)

  const autoAddTriggered = useRef(false)

  const variants = product.variants?.docs || []

  /**
   * Find the selected variant from the URL.
   */
  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (!product.enableVariants || !variants.length) {
      return undefined
    }

    const variantId = searchParams.get('variant')

    if (!variantId) {
      return undefined
    }

    const validVariant = variants.find((variant) => {
      if (typeof variant === 'object') {
        return String(variant.id) === variantId
      }

      return String(variant) === variantId
    })

    if (validVariant && typeof validVariant === 'object') {
      return validVariant
    }

    return undefined
  }, [product.enableVariants, variants, searchParams])

  /**
   * Add the product / selected variant to the cart.
   */
  const addProductToCart = useCallback(async () => {
    await addItem({
      product: product.id,
      variant: selectedVariant?.id ?? undefined,
    })
  }, [addItem, product.id, selectedVariant?.id])

  /**
   * Handle manual Add To Cart button.
   */
  const handleAddToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      try {
        await addProductToCart()

        toast.success(
          locale === 'de' ? 'Artikel zum Warenkorb hinzugefügt.' : 'Item added to cart.',
        )

        openCart()
      } catch (error) {
        console.error('Failed to add item to cart:', error)

        toast.error(
          locale === 'de'
            ? 'Artikel konnte nicht zum Warenkorb hinzugefügt werden.'
            : 'Failed to add item to cart.',
        )
      }
    },
    [addProductToCart, locale, openCart],
  )

  /**
   * Automatically add the product when ?add=1 is present.
   *
   * IMPORTANT:
   *
   * We wait for CartInitialization before calling addItem().
   *
   * This prevents the following race:
   *
   *   localStorage has an existing cart
   *          ↓
   *   EcommerceProvider is restoring it
   *          ↓
   *   cartID is temporarily undefined
   *          ↓
   *   addItem() is called too early
   *          ↓
   *   EcommerceProvider creates a NEW cart
   *
   * For a brand-new guest with no stored cart,
   * CartInitialization immediately becomes true and
   * addItem() is allowed to create the first cart.
   */
  useEffect(() => {
    const shouldAutoAdd = searchParams.get('add') === '1'

    if (!shouldAutoAdd) {
      return
    }

    /**
     * Prevent duplicate automatic additions.
     */
    if (autoAddTriggered.current) {
      return
    }

    /**
     * Wait until EcommerceProvider has finished the relevant
     * cart initialization.
     */
    if (!isCartInitialized) {
      return
    }

    /**
     * Don't start another cart operation while one is running.
     */
    if (isLoading) {
      return
    }

    /**
     * A product with variants requires a valid selected variant.
     */
    if (product.enableVariants && !selectedVariant) {
      return
    }

    autoAddTriggered.current = true
    setIsAutoAdding(true)

    const run = async () => {
      try {
        await addProductToCart()

        /**
         * Remove ?add=1 from the URL after the item has
         * been successfully submitted to the cart.
         */
        const updatedParams = new URLSearchParams(searchParams.toString())

        updatedParams.delete('add')

        const queryString = updatedParams.toString()

        router.replace(`${window.location.pathname}${queryString ? `?${queryString}` : ''}`, {
          scroll: false,
        })

        /**
         * Open the cart after adding the product.
         */
        openCart()
      } catch (error) {
        console.error('Cannot automatically add product to cart:', error)

        /**
         * Allow another attempt if the operation fails.
         */
        autoAddTriggered.current = false

        toast.error(
          locale === 'de'
            ? 'Artikel konnte nicht zum Warenkorb hinzugefügt werden.'
            : 'Unable to add item to cart.',
        )
      } finally {
        setIsAutoAdding(false)
      }
    }

    void run()
  }, [
    searchParams,
    isCartInitialized,
    isLoading,
    product.enableVariants,
    selectedVariant,
    addProductToCart,
    router,
    openCart,
    locale,
  ])

  /**
   * Determine whether the Add To Cart button should be disabled.
   */
  const disabled = useMemo(() => {
    /**
     * Products with variants.
     */
    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      /**
       * Variant is out of stock.
       */
      if (typeof selectedVariant.inventory === 'number' && selectedVariant.inventory <= 0) {
        return true
      }

      /**
       * Find the same product + variant in the cart.
       */
      const existingItem = cart?.items?.find((item) => {
        const itemProduct = typeof item.product === 'object' ? item.product.id : item.product

        const itemVariant = typeof item.variant === 'object' ? item.variant.id : item.variant

        return (
          String(itemProduct) === String(product.id) &&
          String(itemVariant) === String(selectedVariant.id)
        )
      })

      if (existingItem) {
        const quantity = existingItem.quantity || 0

        /**
         * Don't allow quantity to exceed inventory.
         */
        if (
          typeof selectedVariant.inventory === 'number' &&
          quantity >= selectedVariant.inventory
        ) {
          return true
        }
      }

      return false
    }

    /**
     * Products without variants.
     */

    if (typeof product.inventory === 'number' && product.inventory <= 0) {
      return true
    }

    /**
     * Find the product in the cart.
     */
    const existingItem = cart?.items?.find((item) => {
      const itemProduct = typeof item.product === 'object' ? item.product.id : item.product

      return String(itemProduct) === String(product.id) && !item.variant
    })

    if (existingItem) {
      const quantity = existingItem.quantity || 0

      /**
       * Don't allow quantity to exceed inventory.
       */
      if (typeof product.inventory === 'number' && quantity >= product.inventory) {
        return true
      }
    }

    return false
  }, [cart, product, selectedVariant])

  return (
    <>
      {isAutoAdding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin" />

            <span>
              {locale === 'de'
                ? 'Artikel wird zum Warenkorb hinzugefügt...'
                : 'Adding item to cart...'}
            </span>
          </div>
        </div>
      )}

      <Button
        aria-label="Add to cart"
        variant="outline"
        className={clsx('rounded-none', {
          'opacity-50': disabled,
        })}
        disabled={disabled || isLoading || isAutoAdding}
        onClick={handleAddToCart}
        type="submit"
      >
        {isAutoAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            {locale === 'de' ? 'Wird hinzugefügt...' : 'Adding...'}
          </>
        ) : locale === 'de' ? (
          'In den Warenkorb legen'
        ) : (
          'Add To Cart'
        )}
      </Button>
    </>
  )
}
