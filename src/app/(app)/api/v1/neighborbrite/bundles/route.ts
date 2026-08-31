import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.NEIGHBORBRITE_API_TOKEN

  if (!expectedToken || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid authorization header' },
      { status: 401 },
    )
  }

  const token = authHeader.split(' ')[1]
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Forbidden: Invalid bearer token' }, { status: 403 })
  }
  try {
    const payload = await getPayload({ config })

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://eledesign.de'

    // 1. Fetch products
    const productsRes = await payload.find({
      collection: 'products',
      locale: 'all',
      depth: 2,
      where: {
        sync_to_neighborbrite: {
          equals: true,
        },
        _status: {
          equals: 'published',
        },
        product_type: {
          equals: 'garden',
        },
      },

      limit: 50,
    })

    // 2. Build Neighborbrite feed
    const feed = await Promise.all(
      productsRes.docs.map(async (doc: any) => {
        // --------------------------------------------------
        // Product images
        // --------------------------------------------------

        const images = (doc.gallery || [])
          .map((item: any) => {
            const mediaObj = typeof item.image === 'object' ? item.image : null

            if (!mediaObj?.url) {
              return null
            }

            return mediaObj.url.startsWith('http') ? mediaObj.url : `${baseUrl}${mediaObj.url}`
          })
          .filter(Boolean)

        // --------------------------------------------------
        // Fetch variants directly
        // --------------------------------------------------

        const variantsRes = await payload.find({
          collection: 'variants',
          depth: 2,
          where: {
            product: {
              equals: doc.id,
            },
          },
          limit: 100,
        })

        console.log(`Product ${doc.id} -> ${variantsRes.docs.length} variants`)

        // --------------------------------------------------
        // Map variants
        // --------------------------------------------------

        const variants = variantsRes.docs.map((variant: any) => {
          return {
            id: variant.id,

            title: variant.title || '',

            price: variant.priceInEUR || 0,

            // price_enabled: variant.priceInEUREnabled || false,

            inventory: variant.inventory || 0,

            in_stock: variant.in_stock ?? variant.inventory > 0,

            total_plant_quantity: variant.total_plant_quantity || 0,
          }
        })

        const plants = (doc.set_items || []).map((item: any) => ({
          product_id: item.plant.id || '',
          title: item.plant.title || '',

          density_per_sqm: item.density_per_sqm || 0,
        }))
        return {
          id: doc.id,

          sku: doc.sku || '',

          status: doc._status === 'published' ? 'active' : 'draft',

          names: doc.common_name || {},

          descriptions: doc.description || {},

          images,
          items: plants,

          style_tags: doc.style_tags || [],

          in_stock: variants.some((variant: any) => variant.inventory > 0),

          variants,

          updated_at: doc.updatedAt,
        }
      }),
    )

    return NextResponse.json(feed, {
      status: 200,

      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating Neighborbrite feed:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      {
        status: 500,
      },
    )
  }
}
