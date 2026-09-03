import { GardenGridItem } from '@/components/GardenGridItem'
import { Grid } from '@/components/Grid'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  description: 'Search for garden products in the store.',
  title: 'Gardens',
}

type SearchParams = {
  [key: string]: string | string[] | undefined
}

type Props = {
  searchParams: Promise<SearchParams>
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function ShopPage({ searchParams, params }: Props) {
  const { q: searchValue, sort, category, maintenance, sunlight } = await searchParams
  const { locale } = await params

  const payload = await getPayload({
    config: configPromise,
  })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,

    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInEUR: true,
      common_name: true,
      description: true,
      maintenance_level_garden_set: true,
    },
    locale,

    ...(sort ? { sort } : { sort: 'title' }),

    where: {
      and: [
        // Only Garden Set / Package products
        {
          product_type: {
            equals: 'garden',
          },
        },

        // Only published products
        {
          _status: {
            equals: 'published',
          },
        },

        // Search
        ...(searchValue
          ? [
              {
                or: [
                  {
                    title: {
                      like: searchValue,
                    },
                  },
                  {
                    description: {
                      like: searchValue,
                    },
                  },
                ],
              },
            ]
          : []),

        // Category
        ...(category
          ? [
              {
                categories: {
                  contains: category,
                },
              },
            ]
          : []),

        // Maintenance level
        ...(maintenance
          ? [
              {
                maintenance_level_garden_set: {
                  equals: maintenance,
                },
              },
            ]
          : []),

        // Sunlight
        ...(sunlight
          ? [
              {
                sunlight_garden_set: {
                  contains: sunlight,
                },
              },
            ]
          : []),
      ],
    },
  })

  const resultsText = products.docs.length > 1 ? 'results' : 'result'

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {products.docs.length === 0
            ? 'There are no gardens that match '
            : `Showing ${products.docs.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products.docs.length === 0 && (
        <p className="mb-4">No gardens found. Please try different filters.</p>
      )}

      {products.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.docs.map((product) => (
            <GardenGridItem garden={product} locale={locale} key={product.id} />
          ))}
        </Grid>
      ) : null}
    </div>
  )
}
