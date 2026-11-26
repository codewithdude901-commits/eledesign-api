import type { CollectionBeforeChangeHook } from 'payload'

export const populateOrderCustomerEmail: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (data.customerEmail) return data
  if (!data.customer) return data

  const customerID = typeof data.customer === 'object' && data.customer !== null && 'id' in data.customer
    ? (data.customer as { id: string | number }).id
    : data.customer

  try {
    const user = await req.payload.findByID({
      collection: 'users',
      depth: 0,
      id: customerID as string | number,
      overrideAccess: true,
      req,
    }) as { email?: string | null }
    if (user?.email) {
      return { ...data, customerEmail: user.email }
    }
  } catch { /* ignore */ }

  return data
}