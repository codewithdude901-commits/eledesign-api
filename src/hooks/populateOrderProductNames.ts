import type { CollectionBeforeChangeHook } from 'payload'

export const populateOrderProductNames: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (!Array.isArray(data.items)) return data

  const items = await Promise.all(
    data.items.map(async (item) => {
      // Preserve an existing product name snapshot
      if (item.product_name) return item

      if (!item.product) return item

      let product: { title?: string } | null = null

      // Product relationship may already be populated
      if (typeof item.product === 'object') {
        product = item.product as { title?: string }
      } else {
        product = await req.payload.findByID({
          collection: 'products',
          id: item.product,
          depth: 0,
          overrideAccess: true,
        })
      }

      return {
        ...item,
        product_name: product?.title ?? '',
      }
    }),
  )

  return {
    ...data,
    items,
  }
}
