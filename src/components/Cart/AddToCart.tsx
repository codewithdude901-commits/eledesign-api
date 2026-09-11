'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'
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
  const { openCart } = useCartUI()

  const params = useParams<{ locale: 'de' | 'en' }>()
  const locale = params.locale

  const searchParams = useSearchParams()
  const router = useRouter()

  const [isAutoAdding, setIsAutoAdding] = useState(false)

  /**
   * Prevent the ?add=1 effect from running more than once.
   */
  const autoAddTriggered = useRef(false)

  const variants = product.variants?.docs || []

  /**
   * Find the variant selected in the URL.
   *
   * Example:
   * ?garden_area=6a95709912a1aa600b75ff80
   * &variant=6a9570ac12a1aa600b75ffb7
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
   * Add the current product/variant to the Payload cart.
   *
   * IMPORTANT:
   * Payload's addItem() automatically refreshes the cart using
   * the guest cart secret when necessary.
   *
   * Therefore we should NOT call refreshCart() afterwards.
   */
  const addProductToCart = useCallback(async () => {
    await addItem({
      product: product.id,
      variant: selectedVariant?.id ?? undefined,
    })
  }, [addItem, product.id, selectedVariant?.id])

  /**
   * Normal "Add to Cart" button.
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
   * Automatically add the product when Neighborbrite redirects
   * the customer to:
   *
   * /products/slug?
   * garden_area=...&
   * variant=...&
   * add=1
   *
   * We wait for Payload's cart to be restored before calling addItem().
   */
  useEffect(() => {
    const shouldAutoAdd = searchParams.get('add') === '1'

    if (!shouldAutoAdd) {
      return
    }

    /**
     * Don't run the automatic add more than once.
     */
    if (autoAddTriggered.current) {
      return
    }

    /**
     * Payload EcommerceProvider restores the cart asynchronously.
     *
     * If we call addItem() before the cart has been restored,
     * Payload may think there is no existing cart and create
     * another cart.
     */
    if (isLoading) {
      return
    }

    if (!cart) {
      return
    }

    /**
     * Variant products must have a valid variant selected.
     */
    if (product.enableVariants && !selectedVariant) {
      return
    }

    /**
     * Mark it as triggered BEFORE starting the async operation.
     * This prevents duplicate calls caused by rerenders.
     */
    autoAddTriggered.current = true
    setIsAutoAdding(true)

    const run = async () => {
      try {
        /**
         * Payload addItem():
         *
         * 1. Uses the existing cart.
         * 2. Sends the guest cart secret when required.
         * 3. Adds the product/variant.
         * 4. Refreshes the cart using the same secret.
         *
         * Do NOT call refreshCart() here.
         */
        await addProductToCart()

        /**
         * Remove only ?add=1 from the URL.
         *
         * Keep:
         * - garden_area
         * - variant
         * - nb_client_id
         * - any other query parameters
         */
        const updatedParams = new URLSearchParams(searchParams.toString())

        updatedParams.delete('add')

        const queryString = updatedParams.toString()

        router.replace(`${window.location.pathname}${queryString ? `?${queryString}` : ''}`, {
          scroll: false,
        })

        /**
         * Open the cart drawer after the item has been added.
         */
        openCart()
      } catch (error) {
        console.error('Cannot automatically add product to cart:', error)

        /**
         * Allow the effect to try again if the operation actually
         * throws an error.
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
    cart,
    isLoading,
    product.enableVariants,
    selectedVariant,
    addProductToCart,
    router,
    openCart,
    locale,
  ])

  /**
   * Determine whether the currently selected product/variant
   * cannot be added.
   */
  const disabled = useMemo(() => {
    /**
     * Variant product
     */
    if (product.enableVariants) {
      /**
       * No variant selected.
       */
      if (!selectedVariant) {
        return true
      }

      /**
       * Variant has no inventory.
       */
      if (typeof selectedVariant.inventory === 'number' && selectedVariant.inventory <= 0) {
        return true
      }

      /**
       * Check whether this variant already exists in the cart.
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
     * Non-variant product.
     */
    if (typeof product.inventory === 'number' && product.inventory <= 0) {
      return true
    }

    /**
     * Check whether the product already exists in the cart.
     */
    const existingItem = cart?.items?.find((item) => {
      const itemProduct = typeof item.product === 'object' ? item.product.id : item.product

      return String(itemProduct) === String(product.id) && !item.variant
    })

    if (existingItem) {
      const quantity = existingItem.quantity || 0

      if (typeof product.inventory === 'number' && quantity >= product.inventory) {
        return true
      }
    }

    return false
  }, [cart, product, selectedVariant])

  return (
    <>
      {/**
       * Full-screen overlay while Neighborbrite's
       * ?add=1 flow is adding the item.
       */}
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
        className={clsx({
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
