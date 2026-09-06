import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // 1. Fetch one published garden product
    const product = await payload.find({
      collection: 'products',
      depth: 2,
      where: {
        product_type: { equals: 'garden' },
      },
      limit: 1,
    })

    if (!product.docs.length) {
      return NextResponse.json({ message: 'No garden products found.' })
    }

    const sampleProduct = product.docs[0]

    // 2. Attempt fetching associated variants
    let sampleVariants: any[] = []
    try {
      const variantsRes = await payload.find({
        collection: 'variants',
        depth: 2,
        where: {
          product: { equals: sampleProduct.id },
        },
        limit: 5,
      })
      sampleVariants = variantsRes.docs
    } catch (err: any) {
      console.warn('Could not query "variants" collection directly:', err.message)
    }

    // Return the raw structure for inspection
    return NextResponse.json({
      productKeys: Object.keys(sampleProduct),
      sampleProduct,
      sampleVariants,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}