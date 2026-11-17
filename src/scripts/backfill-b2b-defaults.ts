import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * One-off backfill for data created before the B2B layer.
 * New documents already receive these defaults; this only normalizes old documents.
 *
 * Run with:
 *   node --env-file=.env --import tsx src/scripts/backfill-b2b-defaults.ts
 */
const run = async () => {
  const payload = await getPayload({ config })

  const users = await payload.update({
    collection: 'users',
    data: {
      accountType: 'b2c',
    } as never,
    overrideAccess: true,
    where: {
      accountType: {
        exists: false,
      },
    } as never,
  })

  const carts = await payload.update({
    collection: 'carts',
    data: {
      channel: 'b2c',
    } as never,
    overrideAccess: true,
    where: {
      channel: {
        exists: false,
      },
    } as never,
  })

  const orders = await payload.update({
    collection: 'orders',
    data: {
      channel: 'b2c',
    } as never,
    overrideAccess: true,
    where: {
      channel: {
        exists: false,
      },
    } as never,
  })

  payload.logger.info({
    msg: 'B2B defaults backfilled',
    orders: orders.docs.length,
    carts: carts.docs.length,
    users: users.docs.length,
  })

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
