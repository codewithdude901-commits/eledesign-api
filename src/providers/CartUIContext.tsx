'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'

type CartUIContextType = {
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined)

export function CartUIProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = useCallback(() => {
    setIsCartOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  return (
    <CartUIContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartUIContext.Provider>
  )
}

export function useCartUI() {
  const context = useContext(CartUIContext)

  if (!context) {
    throw new Error('useCartUI must be used within a CartUIProvider')
  }

  return context
}