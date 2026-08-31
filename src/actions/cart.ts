'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { addItem } from '@payloadcms/plugin-ecommerce'

const CART_COOKIE_NAME = 'cart'
const CARTS_SLUG = 'carts'

/**
 * Gets or creates a valid Payload Cart ID from browser cookies.
 */
export async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies()
  const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value

  const payload = await getPayload({ config: configPromise })

  if (existingCartId) {
    try {
      // Verify cart exists in database
      const existingCart = await payload.findByID({
        collection: CARTS_SLUG,
        id: existingCartId,
      })
      if (existingCart) return existingCart.id
    } catch {
      // Cookie is stale/invalid, proceed to create a new one
    }
  }

  // Create a fresh cart document using Payload Local API
  const newCart = await payload.create({
    collection: CARTS_SLUG,
    data: {
      items: [],
    },
  })

  // Set HTTP-only cookie valid for 30 days
  cookieStore.set(CART_COOKIE_NAME, newCart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return newCart.id
}

/**
 * Bulk adds multiple items to the current user's Payload cart.
 */
export async function addItemsToCart(
  items: Array<{ product: string; quantity: number }>
) {
  const cartID = await getOrCreateCartId()
  const payload = await getPayload({ config: configPromise })

  let updatedCart

  for (const item of items) {
    updatedCart = await addItem({
      payload,
      cartsSlug: CARTS_SLUG,
      cartID,
      item: {
        product: item.product,
      },
      quantity: item.quantity,
    })
  }

  return updatedCart
}