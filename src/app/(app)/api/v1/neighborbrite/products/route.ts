import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

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
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://eledesign.de'

    // 2. Fetch all products marked for sync with ALL locales
    const productsRes = await payload.find({
      collection: 'products',
      locale: 'all', // Ensures title and description return { de: "...", en: "..." }
      depth: 2, // Populate gallery images and category relationships
      where: {
        sync_to_neighborbrite: {
          equals: true,
        },
        _status: {
          equals: 'published',
        },
      },
      limit: 1000,
    })

    // 3. Map Payload documents to Neighborbrite JSON schema
    const feed = productsRes.docs.map((doc: any) => {
      // Map gallery image uploads to full URLs
      const images = (doc.gallery || [])
        .map((item: any) => {
          const mediaObj = typeof item.image === 'object' ? item.image : null
          if (!mediaObj?.url) return null
          return mediaObj.url.startsWith('http') ? mediaObj.url : `${baseUrl}${mediaObj.url}`
        })
        .filter(Boolean)

      // Extract category title or slug
      const categoryName =
        typeof doc.category_ref === 'object' && doc.category_ref?.title
          ? typeof doc.category_ref.title === 'object'
            ? doc.category_ref.title.de || doc.category_ref.title.en
            : doc.category_ref.title
          : 'perennials'

      const attrs = doc.attributes || {}

      return {
        id: doc.id,
        sku: doc.sku || '',
        status: doc._status === 'published' ? 'active' : 'draft',
        botanical_name: doc.botanical_name || '',
        botanical_name_full: doc.botanical_name_full || '',
        cultivar: doc.cultivar || '',
        names: doc.common_name || {}, // Payload localized object: { "de": "...", "en": "..." }
        descriptions: doc.description || {}, // Payload localized object: { "de": "...", "en": "..." }
        category: categoryName.toLowerCase(),
        indoor_outdoor: doc.indoor_outdoor || 'outdoor',
        images: images,
        attributes: {
          hardiness_zone_min: attrs.hardiness_zone_min || '',
          sunlight: attrs.sunlight || [],
          mature_height_cm: {
            min: attrs.mature_height_min_cm ?? 0,
            max: attrs.mature_height_max_cm ?? 0,
          },
          mature_width_cm: {
            min: attrs.mature_width_min_cm ?? 0,
            max: attrs.mature_width_max_cm ?? 0,
          },
          foliage_type: attrs.foliage_type || '',
          bloom_season: attrs.bloom_season || [],
          flower_color: attrs.flower_color || [],
          water_requirements: attrs.water_requirements || 'medium',
          drought_tolerant: Boolean(attrs.drought_tolerant),
          deer_resistant: Boolean(attrs.deer_resistant),
          pollinator_friendly: attrs.pollinator_friendly || [],
          pet_safe: attrs.pet_safe || 'unknown',
        },
        external_refs: {
          feed_item_id: doc.external_refs?.feed_item_id || doc.sku || '',
        },
        style_tags: doc.style_tags || [],
        updated_at: doc.updatedAt,
      }
    })

    return NextResponse.json(feed, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating Neighborbrite feed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
