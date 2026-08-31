import configPromise from '@payload-config'
import { addItem } from '@payloadcms/plugin-ecommerce'
import { createLocalReq, getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const DUMMY_PRODUCT_ID = '6a91af0c795b4182ade47a0a'
    const DUMMY_VARIANT_ID = '6a91b069795b4182ade47ce3'

    // 1. Create guest cart
    const newCart = await payload.create({
      collection: 'carts',
      data: {
        items: [],
      },
    })

    // 2. Get the hidden cart secret
    const cartWithSecret = await payload.findByID({
      collection: 'carts',
      id: newCart.id,
      overrideAccess: true,
    })

    if (!cartWithSecret.secret) {
      throw new Error('Cart secret was not generated')
    }

    // 3. Create a PayloadRequest
    const req = await createLocalReq(
      {
        context: {},
      },
      payload,
    )

    // 4. Add item using guest cart secret
    const result = await addItem({
      payload,
      cartsSlug: 'carts',
      cartID: newCart.id,
      item: {
        product: DUMMY_PRODUCT_ID,
        variant: DUMMY_VARIANT_ID,
      },
      quantity: 1,
      req,
      secret: cartWithSecret.secret,
    })

    return NextResponse.json({
      success: result.success,
      cartID: newCart.id,
      cart: result.cart,
      secret: cartWithSecret.secret,
    })
  } catch (error) {
    console.error('BUY NOW ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}