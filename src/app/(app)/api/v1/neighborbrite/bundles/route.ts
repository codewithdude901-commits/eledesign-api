import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

interface SetItem {
  density_per_sqm?: number
  plant?: {
    id?: string
    sku?: string
    slug?: string
  }
}

interface VariantOption {
  id?: string
  value?: string
  label?: string
}

interface ProductVariant {
  id: string
  title?: string
  priceInEUR?: number
  total_plant_quantity?: number
  in_stock?: boolean
  updatedAt?: string
  options?: VariantOption[]
}

interface PayloadProduct {
  id: string
  sku: string
  slug: string
  product_type?: string
  product_status?: string
  title: string
  common_name?: string
  description?: string
  priceInEUR: number
  updatedAt: string
  style_tags?: string[]
  gallery?: Array<{ image?: { url?: string } }>
  set_items?: SetItem[]
  variants?: ProductVariant[] | { docs?: ProductVariant[] }
}

/**
 * Ensures image URLs are valid, space-encoded, absolute URLs.
 */
function formatImageUrl(rawUrl: string | undefined | null, baseUrl: string): string | null {
  if (!rawUrl) return null

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return encodeURI(rawUrl)
  }

  const relativePath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return encodeURI(`${baseUrl}${relativePath}`)
}

/**
 * Extracts square meters directly from variant option strings or titles.
 */
function extractSquareMeters(str: string): number | null {
  if (!str) return null
  const match = str.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}

/**
 * Normalizes variants regardless of whether Payload returns a direct array or populated object.
 */
function normalizeVariants(variantsRaw: any): ProductVariant[] {
  if (!variantsRaw) return []
  if (typeof variantsRaw === 'object' && Array.isArray(variantsRaw.docs)) {
    return variantsRaw.docs.filter((v: any) => typeof v === 'object' && v !== null)
  }
  if (Array.isArray(variantsRaw)) {
    return variantsRaw.filter((v: any) => typeof v === 'object' && v !== null)
  }
  return []
}

/**
 * Encodes an ISO timestamp string into a Base64 cursor token.
 */
function encodeCursor(timestamp: string): string {
  return Buffer.from(timestamp).toString('base64')
}

/**
 * Decodes a Base64 cursor string back to an ISO timestamp.
 */
function decodeCursor(cursor: string): string | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
    return isNaN(Date.parse(decoded)) ? null : decoded
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  // 1. Bearer Token Authentication Check
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
    const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://eledesign.de'

    const searchParams = req.nextUrl.searchParams
    const cursorParam = searchParams.get('cursor')
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10)

    // Enforce limit boundaries (minimum 1, maximum 250)
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 50 : rawLimit), 250)

    const whereQuery: Record<string, any> = {
      product_type: {
        equals: 'garden',
      },
      sync_to_neighborbrite: {
        equals: true,
      },
      _status: {
        equals: 'published',
      },
    }

    // Apply cursor filter if a valid cursor parameter is supplied
    if (cursorParam) {
      const decodedTimestamp = decodeCursor(cursorParam)
      if (decodedTimestamp) {
        whereQuery.updatedAt = {
          less_than: decodedTimestamp,
        }
      }
    }

    // Parallel execution for German products, English products, and total count query
    const [{ docs: productsDe }, { docs: productsEn }, totalCountResult] = await Promise.all([
      payload.find({
        collection: 'products',
        locale: 'de',
        where: whereQuery,
        sort: '-updatedAt',
        limit: limit + 1,
        depth: 2,
      }),
      payload.find({
        collection: 'products',
        locale: 'en',
        where: whereQuery,
        sort: '-updatedAt',
        limit: limit + 1,
        depth: 2,
      }),
      payload.count({
        collection: 'products',
        where: {
          product_type: { equals: 'garden' },
          sync_to_neighborbrite: { equals: true },
          _status: { equals: 'published' },
        },
      }),
    ])

    const total = totalCountResult.totalDocs
    const hasMore = productsDe.length > limit
    const pageProductsDe = hasMore ? productsDe.slice(0, limit) : productsDe

    const enMap = new Map<string, PayloadProduct>(productsEn.map((p: any) => [p.id, p]))

    const bundles = pageProductsDe.flatMap((productDe: any) => {
      const productEn = enMap.get(productDe.id)
      const variants = normalizeVariants(productDe.variants)

      if (variants.length === 0) {
        return []
      }

      const images = (productDe.gallery || [])
        .map((item: any) => formatImageUrl(item.image?.url, BASE_URL))
        .filter((url: string | null): url is string => Boolean(url))

      const commonNameDe = productDe.common_name || productDe.title
      const commonNameEn = productEn?.common_name || productEn?.title || commonNameDe

      const descDe = productDe.description || ''
      const descEn = productEn?.description || descDe

      return variants.map((variant: ProductVariant) => {
        const selectedOption = variant.options?.[0]
        const optionVal = selectedOption?.value || selectedOption?.label || variant.title || ''
        const optionId = selectedOption?.id || ''

        const parsedArea = extractSquareMeters(optionVal)
        const areaSqm = parsedArea !== null ? parsedArea : 10

        const variantSkuSuffix = optionVal
          ? optionVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
          : variant.id.slice(-6)
        const generatedSku = `${productDe.sku}-${variantSkuSuffix}`

        const items = (productDe.set_items || []).map((item: SetItem) => {
          const plantQty = Math.round((item.density_per_sqm || 1) * areaSqm)
          return {
            variant_id: item.plant?.sku || item.plant?.slug || item.plant?.id || '',
            quantity: Math.max(1, plantQty),
          }
        })

        const priceAmount = ((variant.priceInEUR || productDe.priceInEUR) / 100).toFixed(2)

        const urlParams = new URLSearchParams()
        if (optionId) {
          urlParams.set('garden_area', optionId)
        }
        urlParams.set('variant', variant.id)

        const productUrl = `${BASE_URL}/products/${productDe.slug}?${urlParams.toString()}`
        const purchaseUrl = `${BASE_URL}/products/${productDe.slug}?${urlParams.toString()}&add=1`

        return {
          id: variant.id,
          sku: generatedSku,
          status: productDe.product_status === 'active' ? 'active' : 'inactive',
          names: {
            'de-DE': `${commonNameDe} (${areaSqm} m²)`,
            en: `${commonNameEn} (${areaSqm} m²)`,
          },
          descriptions: {
            'de-DE': descDe,
            en: descEn,
          },
          images,
          items,
          style_tags: productDe.style_tags || [],
          price: {
            amount: priceAmount,
            currency: 'EUR',
          },
          in_stock: Boolean(variant.in_stock),
          purchase_url: purchaseUrl,
          product_url: productUrl,
          updated_at: variant.updatedAt || productDe.updatedAt,
        }
      })
    })

    // Generate cursor string from the last record on the current page
    let nextCursor: string | null = null
    if (hasMore && pageProductsDe.length > 0) {
      const lastProduct = pageProductsDe[pageProductsDe.length - 1]
      nextCursor = encodeCursor(lastProduct.updatedAt)
    }

    return NextResponse.json(
      {
        data: bundles,
        pagination: {
          total,
          limit,
          has_more: hasMore,
          next_cursor: nextCursor,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      },
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to generate Neighborbrite feed', details: errorMessage },
      { status: 500 },
    )
  }
}
