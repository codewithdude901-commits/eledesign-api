'use client'

import { useEffect, useRef } from 'react'

type RepriceableCart = {
  id?: null | string
  items?: null | unknown[]
}

/**
 * Carts created before a pricing/stock rule change can still hold the old
 * `b2bIssue` / `unitPrice` snapshot. A read does not run beforeChange hooks,
 * so re-save the cart once when the B2B cart or checkout page mounts.
 */
export const useRepriceB2BCart = ({
  cart,
  refreshCart,
}: {
  cart?: null | RepriceableCart
  refreshCart: () => Promise<unknown>
}) => {
  const repricedCartID = useRef<null | string>(null)

  useEffect(() => {
    if (!cart?.id || !cart.items?.length) return
    if (repricedCartID.current === cart.id) return

    repricedCartID.current = cart.id
    let cancelled = false

    const reprice = async () => {
      try {
        const response = await fetch(`/api/carts/${cart.id}`, {
          body: JSON.stringify({
            items: cart.items,
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        if (response.ok && !cancelled) {
          await refreshCart()
        }
      } catch {
        // The server remains authoritative at checkout; a failed reprice
        // should not block the page.
      }
    }

    void reprice()

    return () => {
      cancelled = true
    }
  }, [cart?.id, cart?.items, refreshCart])
}
