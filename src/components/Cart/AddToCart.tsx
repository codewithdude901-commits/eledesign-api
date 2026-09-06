'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'
import { useCartUI } from '@/providers/CartUIContext'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { addItem, cart, isLoading, refreshCart } = useCart()
  const { openCart } = useCartUI()

  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale
  const searchParams = useSearchParams()
  const router = useRouter()

  // Prevent ?add=1 from executing more than once
  const autoAddTriggered = useRef(false)

  const variants = product.variants?.docs || []

  /*
   * Find the selected variant from ?variant=...
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

  /*
   * Normal add-to-cart operation.
   *
   * This uses Payload's EcommerceProvider.
   */
  const addProductToCart = useCallback(async () => {
    await addItem({
      product: product.id,
      variant: selectedVariant?.id ?? undefined,
    })
  }, [addItem, product.id, selectedVariant?.id])

  /*
   * Normal "Add To Cart" button.
   */
  const handleAddToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      try {
        await addProductToCart()

        toast.success('Item added to cart.')
        openCart()
      } catch (error) {
        console.error('Failed to add item to cart:', error)
        toast.error('Failed to add item to cart.')
      }
    },
    [addProductToCart, openCart],
  )

  /*
   * Special external hand-off flow.
   *
   * Example:
   *
   * /products/garden-1?variant=XYZ&add=1
   *
   * IMPORTANT:
   * We deliberately do NOT use addItem() here.
   *
   * Payload's addItem() decides whether to create a new cart
   * based on its internal cartID state. During page initialization
   * that state can still be undefined even though localStorage
   * already contains the existing cart.
   *
   * Therefore we use the persisted cart ID directly.
   */
  const autoAddProduct = useCallback(async () => {
    if (!cart?.id) {
      throw new Error('Cart has not been restored yet.')
    }

    const cartSecret = localStorage.getItem('cart_secret')

    const response = await fetch(`/api/carts/${cart.id}/add-item`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: {
          product: product.id,
          variant: selectedVariant?.id ?? undefined,
        },
        quantity: 1,
        secret: cartSecret || undefined,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(`Failed to add item to existing cart: ${errorText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to add item to existing cart.')
    }

    return result
  }, [cart?.id, product.id, selectedVariant?.id])

  /*
   * Automatically add product when ?add=1 exists.
   */
  useEffect(() => {
    const shouldAutoAdd = searchParams.get('add') === '1'

    if (!shouldAutoAdd) return
    if (autoAddTriggered.current) return
    if (isLoading) return

    // Wait until Payload has restored the existing cart.
    if (!cart) return

    // Variant products need a selected variant.
    if (product.enableVariants && !selectedVariant) return

    autoAddTriggered.current = true

    const run = async () => {
      try {
        await autoAddProduct()

        // Refresh Payload's cart state.
        await refreshCart()

        // Remove ?add=1 to prevent another automatic add.
        const params = new URLSearchParams(searchParams.toString())
        params.delete('add')

        router.replace(
          `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`,
        )

        openCart()
      } catch (error) {
        console.error('Cannot auto-add product:', error)

        autoAddTriggered.current = false

        toast.error('Unable to add item to cart.')
      }
    }

    void run()
  }, [
    searchParams,
    cart,
    isLoading,
    product.enableVariants,
    selectedVariant,
    autoAddProduct,
    refreshCart,
    router,
    openCart,
  ])

  /*
   * Determine whether the normal Add To Cart button
   * should be disabled.
   */
  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product

      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }

        return true
      }

      return false
    })

    /*
     * Product/variant is already in the cart.
     * Check inventory against current quantity.
     */
    if (existingItem) {
      const existingQuantity = existingItem.quantity || 0

      if (product.enableVariants) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }

      return existingQuantity >= (product.inventory || 0)
    }

    /*
     * Variant product.
     */
    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    }

    /*
     * Normal product.
     */
    else if (product.inventory === 0) {
      return true
    }

    return false
  }, [selectedVariant, cart?.items, product])

  return (
    <Button
      aria-label="Add to cart"
      variant="outline"
      className={clsx({
        'rounded-none hover:opacity-90 bg-emerald-600 hover:bg-emerald-600 text-white min-w-40': true,
      })}
      disabled={disabled || isLoading}
      onClick={handleAddToCart}
      type="submit"
    >
      {locale === 'de' ? 'In den Warenkorb legen' : 'Add To Cart'}
    </Button>
  )
}
