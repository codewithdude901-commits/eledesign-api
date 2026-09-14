'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React, { createContext, useContext, useEffect, useState } from 'react'

type CartInitializationContextValue = {
  isCartInitialized: boolean
}

const CartInitializationContext =
  createContext<CartInitializationContextValue | null>(null)

export function useCartInitialization() {
  const context = useContext(CartInitializationContext)

  if (!context) {
    throw new Error(
      'useCartInitialization must be used inside CartInitialization',
    )
  }

  return context
}

export const CartInitialization: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { cart } = useCart()

  const [isCartInitialized, setIsCartInitialized] = useState(false)

  useEffect(() => {
    const storedCartID = localStorage.getItem('cart')

    /**
     * If there is no stored cart, this is a new guest.
     *
     * EcommerceProvider is ready to create a new cart when addItem()
     * is called.
     */
    if (!storedCartID) {
      setIsCartInitialized(true)
      return
    }

    /**
     * A cart exists in localStorage.
     *
     * EcommerceProvider must restore that cart before we allow
     * AddToCart to call addItem().
     */
    if (cart) {
      setIsCartInitialized(true)
    }
  }, [cart])

  return (
    <CartInitializationContext.Provider
      value={{ isCartInitialized }}
    >
      {children}
    </CartInitializationContext.Provider>
  )
}